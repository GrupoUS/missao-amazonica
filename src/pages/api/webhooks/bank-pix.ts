import type { APIRoute } from 'astro';
import { getProvider } from '@/lib/payments/registry';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logError, logInfo, logWarn } from '@/lib/monitoring/logger';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const rawBody = await request.text();
  const supabase = locals.supabase;
  const { provider, settings } = await getProvider(supabase);

  if (settings.bankStatus === 'not_configured') {
    return Response.json(
      { error: 'Webhook do banco não configurado.', code: 'webhook_disabled' },
      { status: 501 },
    );
  }

  const verification = await provider.verifyWebhook(request, rawBody);

  if (!verification.valid) {
    if (verification.reason === 'no_secret_configured') {
      return Response.json(
        { error: 'Webhook não está pronto.', code: 'webhook_disabled' },
        { status: 501 },
      );
    }
    return Response.json(
      {
        error: 'Assinatura inválida.',
        code:
          verification.reason === 'malformed_body'
            ? 'webhook_malformed'
            : 'webhook_invalid_signature',
      },
      { status: 401 },
    );
  }

  const event = verification.event;
  if (!event) {
    return Response.json(
      { error: 'Evento ausente.', code: 'webhook_malformed' },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();

  // Idempotent insert
  const { data: insertedEvent, error: insertErr } = await admin
    .from('payment_events')
    .insert({
      provider: provider.id,
      event_type: event.eventType,
      bank_end_to_end_id: event.bankEndToEndId,
      txid: event.txid,
      amount_cents: event.amountCents,
      raw_payload: event.rawPayload as never,
    })
    .select('id')
    .maybeSingle();

  if (insertErr) {
    // Postgres unique-violation = code 23505. Idempotent replay → ack 200.
    const code = (insertErr as { code?: string }).code;
    if (code === '23505') {
      logInfo('webhook_replay_ignored', { txid: event.txid, e2e: event.bankEndToEndId });
      return Response.json({ ok: true, replay: true });
    }
    logError(insertErr, { route: 'webhooks/bank-pix', step: 'insert_event' });
    return Response.json(
      { error: 'Erro ao registrar evento.', code: 'internal_error' },
      { status: 500 },
    );
  }

  if (!insertedEvent) {
    return Response.json({ ok: true, replay: true });
  }

  // Match donation intent
  const { data: intent, error: intentErr } = await admin
    .from('donation_intents')
    .select('id, item_id, amount_cents, status')
    .eq('pix_txid', event.txid)
    .eq('status', 'pending')
    .maybeSingle();

  if (intentErr) {
    logError(intentErr, { route: 'webhooks/bank-pix', step: 'match_intent' });
    return Response.json({ ok: true, matched: false });
  }
  if (!intent) {
    logWarn('webhook_orphan_event', { txid: event.txid, e2e: event.bankEndToEndId });
    return Response.json({ ok: true, matched: false });
  }
  if (intent.amount_cents !== event.amountCents) {
    logWarn('webhook_amount_mismatch', {
      intent_id: intent.id,
      expected: intent.amount_cents,
      received: event.amountCents,
    });
    return Response.json(
      { ok: true, matched: false, reason: 'amount_mismatch' },
      { status: 200 },
    );
  }

  // Confirm via plpgsql function (handles excess→reserve splitting + audit)
  const { error: confirmErr } = await admin.rpc('confirm_donation', {
    p_intent_id: intent.id,
    p_event_id: insertedEvent.id,
    p_amount: event.amountCents,
  });

  if (confirmErr) {
    logError(confirmErr, { route: 'webhooks/bank-pix', step: 'confirm_donation' });
    return Response.json(
      { error: 'Erro ao confirmar doação.', code: 'internal_error' },
      { status: 500 },
    );
  }

  // Link the event row to the intent for traceability
  try {
    await admin
      .from('payment_events')
      .update({ donation_intent_id: intent.id })
      .eq('id', insertedEvent.id);
  } catch {
    // best-effort linkage
  }

  logInfo('donation_confirmed_via_webhook', {
    intent_id: intent.id,
    item_id: intent.item_id,
    amount_cents: event.amountCents,
  });

  return Response.json({ ok: true, confirmed: true, intentId: intent.id });
};

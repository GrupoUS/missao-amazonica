import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { logError, logInfo } from '@/lib/monitoring/logger';

export const prerender = false;

const ManualConfirmSchema = z.object({
  intentId: z.string().uuid(),
  notes: z.string().trim().min(1, 'Adicione uma justificativa.').max(500),
});

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.isAdmin) {
    return Response.json(
      { error: 'Acesso negado.', code: 'forbidden' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'JSON inválido', code: 'invalid_json' },
      { status: 400 },
    );
  }

  const parsed = ManualConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Dados inválidos.', code: 'validation_failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  const { data: intent, error: intentErr } = await admin
    .from('donation_intents')
    .select('id, item_id, amount_cents, pix_txid, status')
    .eq('id', parsed.data.intentId)
    .maybeSingle();

  if (intentErr || !intent) {
    return Response.json(
      { error: 'Doação não encontrada.', code: 'intent_not_found' },
      { status: 404 },
    );
  }
  if (intent.status !== 'pending') {
    return Response.json(
      { error: `Doação já está com status "${intent.status}".`, code: 'invalid_status' },
      { status: 409 },
    );
  }

  const e2eId = `MAN-${intent.id}`;

  const { data: insertedEvent, error: insertErr } = await admin
    .from('payment_events')
    .insert({
      provider: 'manual',
      event_type: 'manual.confirm',
      bank_end_to_end_id: e2eId,
      txid: intent.pix_txid,
      amount_cents: intent.amount_cents,
      raw_payload: { notes: parsed.data.notes, confirmed_by: locals.user.id } as never,
    })
    .select('id')
    .maybeSingle();

  if (insertErr || !insertedEvent) {
    const code = (insertErr as { code?: string } | null)?.code;
    if (code === '23505') {
      return Response.json(
        { error: 'Doação já foi confirmada manualmente antes.', code: 'duplicate_manual' },
        { status: 409 },
      );
    }
    logError(insertErr, { route: 'api/admin/manual-confirm', step: 'insert_event' });
    return Response.json(
      { error: 'Erro ao registrar evento.', code: 'internal_error' },
      { status: 500 },
    );
  }

  const { error: confirmErr } = await admin.rpc('confirm_donation', {
    p_intent_id: intent.id,
    p_event_id: insertedEvent.id,
    p_amount: intent.amount_cents,
  });
  if (confirmErr) {
    logError(confirmErr, { route: 'api/admin/manual-confirm', step: 'confirm_donation' });
    return Response.json(
      { error: 'Erro ao confirmar doação.', code: 'internal_error' },
      { status: 500 },
    );
  }

  try {
    await admin
      .from('payment_events')
      .update({ donation_intent_id: intent.id })
      .eq('id', insertedEvent.id);
  } catch {
    // best-effort linkage
  }

  await logAudit({
    actorId: locals.user.id,
    action: 'donation_manually_confirmed',
    entityType: 'donation_intent',
    entityId: intent.id,
    metadata: { notes: parsed.data.notes, e2e_id: e2eId } as never,
  });

  logInfo('donation_manually_confirmed', { intent_id: intent.id, by: locals.user.id });

  return Response.json({ ok: true, intentId: intent.id });
};

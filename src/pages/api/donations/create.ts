import type { APIRoute } from 'astro';
import { ulid } from 'ulid';
import { CreateDonationIntentSchema } from '@/lib/validators/donation';
import { getProvider } from '@/lib/payments/registry';
import { buildItemTxid } from '@/lib/payments/pix';
import { logError, logInfo } from '@/lib/monitoring/logger';
import { hashIp } from '@/lib/audit/log';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'JSON inválido', code: 'invalid_json' },
      { status: 400 },
    );
  }

  const parsed = CreateDonationIntentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Dados de doação inválidos.',
        code: 'validation_failed',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const supabase = locals.supabase;
  const admin = getSupabaseAdmin();

  const { data: item, error: itemErr } = await admin
    .from('donation_items')
    .select('id, title, slug, status, target_amount_cents, pix_txid_prefix')
    .eq('id', input.itemId)
    .maybeSingle();

  if (itemErr) {
    logError(itemErr, { route: 'api/donations/create', step: 'fetch_item' });
    return Response.json(
      { error: 'Erro ao buscar projeto.', code: 'internal_error' },
      { status: 500 },
    );
  }
  if (!item) {
    return Response.json(
      { error: 'Projeto não encontrado.', code: 'item_not_found' },
      { status: 404 },
    );
  }
  if (item.status !== 'published') {
    return Response.json(
      { error: 'Projeto não está aceitando doações.', code: 'item_not_published' },
      { status: 400 },
    );
  }

  const { provider, settings } = await getProvider(supabase);

  if (!settings.pixKey) {
    return Response.json(
      {
        error:
          'A chave PIX da missão ainda não foi configurada pelo administrador.',
        code: 'pix_not_configured',
      },
      { status: 503 },
    );
  }

  const txid = buildItemTxid(item.id, ulid(), item.pix_txid_prefix ?? 'MIS');

  let intentResult;
  try {
    intentResult = await provider.createIntent({
      pixKey: settings.pixKey,
      txid,
      amountCents: input.amountCents,
      merchantName: settings.merchantName,
      merchantCity: settings.merchantCity,
      itemTitle: item.title,
    });
  } catch (err) {
    logError(err, { route: 'api/donations/create', step: 'create_intent', txid });
    return Response.json(
      { error: 'Não foi possível gerar o Pix. Tente novamente.', code: 'pix_generation_failed' },
      { status: 500 },
    );
  }

  const userAgent = request.headers.get('user-agent')?.slice(0, 250) ?? null;
  const ipHash = hashIp(clientAddress ?? null);

  const isAnonymous = input.isAnonymous;
  const displayPublic = isAnonymous ? false : input.displayNamePubliclyConsent;

  const { data: insertedRow, error: insertErr } = await admin
    .from('donation_intents')
    .insert({
      item_id: item.id,
      amount_cents: input.amountCents,
      donor_name: isAnonymous ? null : input.donorName?.trim() || null,
      donor_email: input.donorEmail?.trim() || null,
      donor_phone: input.donorPhone?.trim() || null,
      is_anonymous: isAnonymous,
      display_name_publicly: displayPublic,
      status: 'pending',
      pix_txid: txid,
      pix_payload: intentResult.payload,
      pix_qr_data_url: intentResult.qrDataUrl,
      expires_at: intentResult.expiresAt,
      ip_hash: ipHash,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (insertErr || !insertedRow) {
    logError(insertErr, {
      route: 'api/donations/create',
      step: 'insert_intent',
      txid,
    });
    return Response.json(
      { error: 'Não foi possível registrar a intenção de doação.', code: 'intent_insert_failed' },
      { status: 500 },
    );
  }

  logInfo('donation_intent_created', {
    intent_id: insertedRow.id,
    item_id: item.id,
    amount_cents: input.amountCents,
    provider: provider.id,
  });

  return Response.json({
    intentId: insertedRow.id,
    txid,
    payload: intentResult.payload,
    qrDataUrl: intentResult.qrDataUrl,
    expiresAt: intentResult.expiresAt,
    providerId: provider.id,
  });
};

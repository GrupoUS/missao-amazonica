import type { APIRoute } from 'astro';
import { DonationStatusQuerySchema } from '@/lib/validators/donation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logError } from '@/lib/monitoring/logger';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const parsed = DonationStatusQuerySchema.safeParse({
    intentId: url.searchParams.get('intentId') ?? '',
  });
  if (!parsed.success) {
    return Response.json(
      { error: 'Parâmetros inválidos.', code: 'validation_failed' },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('donation_intents')
    .select('id, status, confirmed_at, expires_at, amount_cents')
    .eq('id', parsed.data.intentId)
    .maybeSingle();

  if (error) {
    logError(error, { route: 'api/donations/status' });
    return Response.json(
      { error: 'Erro ao buscar status.', code: 'internal_error' },
      { status: 500 },
    );
  }
  if (!data) {
    return Response.json(
      { error: 'Doação não encontrada.', code: 'intent_not_found' },
      { status: 404 },
    );
  }

  // Auto-mark as expired when past TTL
  let status = data.status;
  if (status === 'pending' && data.expires_at && new Date(data.expires_at) < new Date()) {
    status = 'expired';
    try {
      await admin
        .from('donation_intents')
        .update({ status: 'expired' })
        .eq('id', data.id)
        .eq('status', 'pending');
    } catch {
      // best-effort
    }
  }

  return Response.json({
    intentId: data.id,
    status,
    confirmedAt: data.confirmed_at,
    amountCents: data.amount_cents,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
};

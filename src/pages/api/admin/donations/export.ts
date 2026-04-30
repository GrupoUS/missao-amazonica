import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const prerender = false;

function csvEscape(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user || !locals.isAdmin) {
    return new Response('Forbidden', { status: 403 });
  }
  const status = url.searchParams.get('status') ?? '';
  const admin = getSupabaseAdmin();
  let query = admin
    .from('donation_intents')
    .select(`
      id, amount_cents, donor_name, donor_email, donor_phone, is_anonymous,
      display_name_publicly, status, pix_txid, created_at, confirmed_at,
      donation_items(title, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(5000);
  if (status && ['pending', 'confirmed', 'expired', 'cancelled', 'failed'].includes(status)) {
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  const headers = [
    'id', 'created_at', 'confirmed_at', 'status',
    'item_title', 'item_slug',
    'amount_cents', 'amount_brl',
    'donor_name', 'donor_email', 'donor_phone',
    'is_anonymous', 'display_name_publicly',
    'pix_txid',
  ];
  const lines = [headers.join(',')];
  for (const r of data ?? []) {
    lines.push([
      csvEscape(r.id),
      csvEscape(r.created_at),
      csvEscape(r.confirmed_at),
      csvEscape(r.status),
      csvEscape(r.donation_items?.title),
      csvEscape(r.donation_items?.slug),
      csvEscape(r.amount_cents),
      csvEscape((r.amount_cents / 100).toFixed(2)),
      csvEscape(r.donor_name),
      csvEscape(r.donor_email),
      csvEscape(r.donor_phone),
      csvEscape(r.is_anonymous),
      csvEscape(r.display_name_publicly),
      csvEscape(r.pix_txid),
    ].join(','));
  }
  const csv = lines.join('\n');
  const filename = `doacoes-${status || 'todas'}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
};

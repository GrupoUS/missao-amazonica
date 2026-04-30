import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { BankStatus } from '@/lib/supabase/aliases';
import type { PixProvider } from './providers/types';
import { bankPixProvider } from './providers/bank-pix-provider';
import { manualProvider } from './providers/manual-provider';
import { logWarn } from '@/lib/monitoring/logger';

interface PixSettings {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  bankStatus: BankStatus;
  bankName: string;
}

const FALLBACK_SETTINGS: PixSettings = {
  pixKey: import.meta.env.PIX_KEY ?? '',
  merchantName: import.meta.env.PIX_MERCHANT_NAME ?? 'MISSAO AMAZONICA',
  merchantCity: import.meta.env.PIX_MERCHANT_CITY ?? 'MANAUS',
  bankStatus: 'not_configured',
  bankName: '',
};

function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  return String(v);
}

export async function getPixSettings(
  supabase: SupabaseClient<Database>,
): Promise<PixSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['pix_key', 'pix_merchant_name', 'pix_merchant_city', 'bank_status', 'bank_name']);

  if (error || !data) {
    logWarn('Could not load Pix settings from DB', { reason: error?.message });
    return FALLBACK_SETTINGS;
  }

  const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
  const bankStatusRaw = asString(map.bank_status);
  const bankStatus: BankStatus =
    bankStatusRaw === 'manual_verification' ||
    bankStatusRaw === 'api_configured' ||
    bankStatusRaw === 'webhook_configured'
      ? bankStatusRaw
      : 'not_configured';

  return {
    pixKey: asString(map.pix_key) || FALLBACK_SETTINGS.pixKey,
    merchantName: asString(map.pix_merchant_name) || FALLBACK_SETTINGS.merchantName,
    merchantCity: asString(map.pix_merchant_city) || FALLBACK_SETTINGS.merchantCity,
    bankStatus,
    bankName: asString(map.bank_name),
  };
}

export function pickProvider(bankStatus: BankStatus): PixProvider {
  if (bankStatus === 'api_configured' || bankStatus === 'webhook_configured') {
    return bankPixProvider;
  }
  return manualProvider;
}

export async function getProvider(
  supabase: SupabaseClient<Database>,
): Promise<{ provider: PixProvider; settings: PixSettings }> {
  const settings = await getPixSettings(supabase);
  return { provider: pickProvider(settings.bankStatus), settings };
}

/**
 * Convenience aliases on top of generated Database types.
 *
 * Generated types use plain `string` for check-constrained enum columns.
 * Use these literal unions in code; Zod validators enforce the same set at API boundaries.
 */

import type { Database } from './types';

export type Urgency = 'low' | 'medium' | 'high' | 'urgent';
export type ItemStatus = 'draft' | 'published' | 'archived' | 'completed';
export type IntentStatus =
  | 'pending'
  | 'confirmed'
  | 'expired'
  | 'cancelled'
  | 'failed';
export type AccountabilityStatus =
  | 'planned'
  | 'purchased'
  | 'delivered'
  | 'completed';
export type PaymentProvider = 'bank_pix' | 'manual' | 'mercado_pago' | 'asaas';
export type ImageType = 'real' | 'illustrative';
export type BankStatus =
  | 'not_configured'
  | 'manual_verification'
  | 'api_configured'
  | 'webhook_configured';

// Row aliases
export type Mission = Database['public']['Tables']['missions']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type DonationItem = Database['public']['Tables']['donation_items']['Row'];
export type DonationIntent = Database['public']['Tables']['donation_intents']['Row'];
export type PaymentEvent = Database['public']['Tables']['payment_events']['Row'];
export type AccountabilityEntry = Database['public']['Tables']['accountability_entries']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Setting = Database['public']['Tables']['settings']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type GlobalReserveEntry = Database['public']['Tables']['global_reserve_entries']['Row'];

// Insert aliases
export type DonationItemInsert = Database['public']['Tables']['donation_items']['Insert'];
export type DonationIntentInsert = Database['public']['Tables']['donation_intents']['Insert'];
export type PaymentEventInsert = Database['public']['Tables']['payment_events']['Insert'];
export type AccountabilityEntryInsert =
  Database['public']['Tables']['accountability_entries']['Insert'];
export type SettingInsert = Database['public']['Tables']['settings']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

// View aliases
export type ItemProgressView = Database['public']['Views']['item_progress']['Row'];
export type LandingStatsView = Database['public']['Views']['landing_stats']['Row'];
export type PublicDonorListView = Database['public']['Views']['public_donor_list']['Row'];
export type ConfirmedAmountByItemView =
  Database['public']['Views']['confirmed_amount_by_item']['Row'];
export type RecentConfirmedDonationView =
  Database['public']['Views']['recent_confirmed_donations']['Row'];
export type GlobalReserveTotalView =
  Database['public']['Views']['global_reserve_total']['Row'];

// Enum-style helpers (typed casts for narrowing reads)
export const URGENCY_VALUES = ['low', 'medium', 'high', 'urgent'] as const satisfies readonly Urgency[];
export const ITEM_STATUS_VALUES = [
  'draft',
  'published',
  'archived',
  'completed',
] as const satisfies readonly ItemStatus[];
export const INTENT_STATUS_VALUES = [
  'pending',
  'confirmed',
  'expired',
  'cancelled',
  'failed',
] as const satisfies readonly IntentStatus[];
export const ACCOUNTABILITY_STATUS_VALUES = [
  'planned',
  'purchased',
  'delivered',
  'completed',
] as const satisfies readonly AccountabilityStatus[];
export const PAYMENT_PROVIDER_VALUES = [
  'bank_pix',
  'manual',
  'mercado_pago',
  'asaas',
] as const satisfies readonly PaymentProvider[];

export function asUrgency(v: string | null | undefined): Urgency {
  return (URGENCY_VALUES as readonly string[]).includes(v ?? '')
    ? (v as Urgency)
    : 'medium';
}

export function asItemStatus(v: string | null | undefined): ItemStatus {
  return (ITEM_STATUS_VALUES as readonly string[]).includes(v ?? '')
    ? (v as ItemStatus)
    : 'draft';
}

export function asIntentStatus(v: string | null | undefined): IntentStatus {
  return (INTENT_STATUS_VALUES as readonly string[]).includes(v ?? '')
    ? (v as IntentStatus)
    : 'pending';
}

export function asAccountabilityStatus(
  v: string | null | undefined,
): AccountabilityStatus {
  return (ACCOUNTABILITY_STATUS_VALUES as readonly string[]).includes(v ?? '')
    ? (v as AccountabilityStatus)
    : 'planned';
}

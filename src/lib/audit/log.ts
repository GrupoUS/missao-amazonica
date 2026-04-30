/**
 * Application-layer audit log writer.
 * Use from admin endpoints to record before/after snapshots beyond what the
 * DB triggers (0005_audit_triggers.sql) capture.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logError } from '@/lib/monitoring/logger';
import type { Json } from '@/lib/supabase/types';

interface AuditArgs {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Json | null;
  after?: Json | null;
  metadata?: Json | null;
  ipHash?: string | null;
}

export async function logAudit(args: AuditArgs): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('audit_logs').insert({
      actor_id: args.actorId ?? null,
      action: args.action,
      entity_type: args.entityType,
      entity_id: args.entityId ?? null,
      before_data: args.before ?? null,
      after_data: args.after ?? null,
      metadata: args.metadata ?? null,
      ip_hash: args.ipHash ?? null,
    });
    if (error) {
      logError(error, { route: 'lib/audit/log', action: args.action });
    }
  } catch (err) {
    logError(err, { route: 'lib/audit/log', action: args.action });
  }
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  // Lightweight non-cryptographic hash — enough to dedupe without storing IPs.
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (h * 31 + ip.charCodeAt(i)) | 0;
  }
  return `ip_${(h >>> 0).toString(16)}`;
}

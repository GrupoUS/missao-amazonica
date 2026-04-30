import { createHmac, timingSafeEqual } from 'node:crypto';
import { buildPixPayload } from '../pix';
import type { PixProvider, CreateIntentArgs, WebhookVerifyResult } from './types';

const INTENT_TTL_MINUTES = 30;

function constantTimeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, 'hex');
    const bBuf = Buffer.from(b, 'hex');
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export const bankPixProvider: PixProvider = {
  id: 'bank_pix',

  async createIntent(args: CreateIntentArgs) {
    const { payload, qrDataUrl } = await buildPixPayload({
      pixKey: args.pixKey,
      txid: args.txid,
      amountCents: args.amountCents,
      merchantName: args.merchantName,
      merchantCity: args.merchantCity,
      description: args.itemTitle,
    });
    return {
      payload,
      qrDataUrl,
      txid: args.txid,
      expiresAt: new Date(Date.now() + INTENT_TTL_MINUTES * 60_000).toISOString(),
    };
  },

  async verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerifyResult> {
    const secret = import.meta.env.PIX_BANK_WEBHOOK_SECRET;
    if (!secret) {
      return { valid: false, reason: 'no_secret_configured' };
    }
    const signatureHeader =
      req.headers.get('x-signature') ?? req.headers.get('X-Signature') ?? '';
    if (!signatureHeader) {
      return { valid: false, reason: 'invalid_signature' };
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const provided = signatureHeader.replace(/^sha256=/i, '').trim();
    if (!constantTimeEqualHex(expected, provided)) {
      return { valid: false, reason: 'invalid_signature' };
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return { valid: false, reason: 'malformed_body' };
    }

    const txid = String(parsed.txid ?? parsed.tx_id ?? '');
    const amountRaw = parsed.amount_cents ?? parsed.amountCents ?? parsed.value;
    const amountCents = typeof amountRaw === 'number' ? amountRaw : Number.parseInt(String(amountRaw ?? 0), 10);
    const bankEndToEndId = String(parsed.bank_end_to_end_id ?? parsed.endToEndId ?? parsed.e2eId ?? '');
    const eventType = String(parsed.event_type ?? parsed.eventType ?? 'pix.received');

    if (!txid || !bankEndToEndId || !Number.isFinite(amountCents) || amountCents <= 0) {
      return { valid: false, reason: 'malformed_body' };
    }

    return {
      valid: true,
      reason: 'ok',
      event: { txid, amountCents, bankEndToEndId, eventType, rawPayload: parsed },
    };
  },

  async queryStatus() {
    // Bank API not yet integrated — assume pending.
    return 'pending';
  },
};

import { buildPixPayload } from '../pix';
import type { PixProvider, CreateIntentArgs } from './types';

const INTENT_TTL_MINUTES = 30;

export const manualProvider: PixProvider = {
  id: 'manual',

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

  async verifyWebhook() {
    // No automated bank integration — webhook is intentionally disabled.
    return { valid: false, reason: 'no_secret_configured' as const };
  },

  async queryStatus() {
    return 'pending' as const;
  },
};

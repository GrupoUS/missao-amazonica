import type { PaymentProvider } from '@/lib/supabase/aliases';

export interface CreateIntentArgs {
  pixKey: string;
  txid: string;
  amountCents: number;
  merchantName: string;
  merchantCity: string;
  itemTitle: string;
}

export interface CreateIntentResult {
  payload: string;
  qrDataUrl: string;
  txid: string;
  expiresAt: string;
}

export interface ParsedWebhookEvent {
  txid: string;
  amountCents: number;
  bankEndToEndId: string;
  eventType: string;
  rawPayload: unknown;
}

export interface WebhookVerifyResult {
  valid: boolean;
  reason?:
    | 'no_secret_configured'
    | 'invalid_signature'
    | 'malformed_body'
    | 'ok';
  event?: ParsedWebhookEvent;
}

export interface PixProvider {
  id: PaymentProvider;
  createIntent(args: CreateIntentArgs): Promise<CreateIntentResult>;
  verifyWebhook(req: Request, rawBody: string): Promise<WebhookVerifyResult>;
  queryStatus?(txid: string): Promise<'pending' | 'confirmed' | 'failed'>;
}

import type { PixProvider } from './types';

/**
 * Mercado Pago provider — stub. Re-enable later by:
 *   1. Renaming file to `mercado-pago-provider.ts`.
 *   2. Importing `MercadoPagoConfig`/`Payment` from `mercadopago`.
 *   3. Implementing createIntent + verifyWebhook against the SDK.
 */

export const mercadoPagoProviderDisabled: PixProvider = {
  id: 'mercado_pago',
  async createIntent() {
    throw new Error('mercado_pago provider is disabled in MVP.');
  },
  async verifyWebhook() {
    throw new Error('mercado_pago provider is disabled in MVP.');
  },
};

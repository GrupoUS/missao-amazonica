import type { PixProvider } from './types';

/**
 * Asaas provider — stub. Re-enable later by:
 *   1. Renaming file to `asaas-provider.ts`.
 *   2. Implementing the Asaas REST integration.
 */

export const asaasProviderDisabled: PixProvider = {
  id: 'asaas',
  async createIntent() {
    throw new Error('asaas provider is disabled in MVP.');
  },
  async verifyWebhook() {
    throw new Error('asaas provider is disabled in MVP.');
  },
};

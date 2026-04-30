const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const BRL_NO_DECIMALS = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const NUMBER_PT = new Intl.NumberFormat('pt-BR');

/** Format integer cents as Brazilian Real currency string. */
export function formatBRL(cents: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(cents)) return BRL.format(0);
  const value = cents / 100;
  if (opts.compact && Math.abs(value) >= 1000) {
    return `R$ ${NUMBER_PT.format(Math.round(value / 100) / 10)}k`;
  }
  return BRL.format(value);
}

/** Format integer cents without the decimal places when whole. */
export function formatBRLClean(cents: number): string {
  if (!Number.isFinite(cents)) return BRL_NO_DECIMALS.format(0);
  const value = cents / 100;
  return Number.isInteger(value) ? BRL_NO_DECIMALS.format(value) : BRL.format(value);
}

/** Parse user input (e.g., "1.500,00", "R$ 50") into integer cents. */
export function parseBRLToCents(input: string): number | null {
  if (!input) return null;
  const cleaned = input
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Compute progress percentage clamped 0-999 (allows showing >100% exceeded). */
export function progressPct(currentCents: number, targetCents: number): number {
  if (!targetCents || targetCents <= 0) return 0;
  const pct = (currentCents / targetCents) * 100;
  if (!Number.isFinite(pct) || pct < 0) return 0;
  return Math.min(999, Math.round(pct));
}

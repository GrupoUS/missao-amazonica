/**
 * Structured logger wrapper. Routes errors through Sentry when configured,
 * otherwise falls back to console with a stable shape for grep.
 *
 * Cardinal: never `console.log` in production. Use these helpers.
 */

const HAS_SENTRY = Boolean(import.meta.env.SENTRY_DSN);

type LogContext = Record<string, unknown>;

function safeStringify(value: unknown): string {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function sentryCaptureException(err: unknown, context?: LogContext) {
  if (!HAS_SENTRY) return;
  try {
    const Sentry = await import('@sentry/astro');
    Sentry.captureException(err, { extra: context });
  } catch {
    // Sentry not available; fall back silently
  }
}

async function sentryCaptureMessage(
  message: string,
  level: 'info' | 'warning' | 'error',
  context?: LogContext,
) {
  if (!HAS_SENTRY) return;
  try {
    const Sentry = await import('@sentry/astro');
    Sentry.captureMessage(message, { level, extra: context });
  } catch {
    // ignore
  }
}

export function logInfo(message: string, context?: LogContext) {
  if (HAS_SENTRY) {
    void sentryCaptureMessage(message, 'info', context);
    return;
  }
  // eslint-disable-next-line no-console
  console.info(`[info] ${message}${context ? ' ' + safeStringify(context) : ''}`);
}

export function logWarn(message: string, context?: LogContext) {
  if (HAS_SENTRY) {
    void sentryCaptureMessage(message, 'warning', context);
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(`[warn] ${message}${context ? ' ' + safeStringify(context) : ''}`);
}

export function logError(err: unknown, context?: LogContext) {
  if (HAS_SENTRY) {
    void sentryCaptureException(err, context);
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[error]', err, context ? safeStringify(context) : '');
}

export const logger = { info: logInfo, warn: logWarn, error: logError };

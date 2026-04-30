/**
 * Resend wrapper. Gracefully no-ops when RESEND_API_KEY is not configured.
 * Cardinal: never throw from email send — log and skip.
 */

import { Resend } from 'resend';
import { logError, logWarn } from '@/lib/monitoring/logger';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  import.meta.env.RESEND_FROM_EMAIL ||
  'Missão Amazônica <missao@missaoamazonica.org>';

let resendClient: Resend | null = null;
function getClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(RESEND_API_KEY);
  return resendClient;
}

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface SendResult {
  ok: boolean;
  skipped?: boolean;
  id?: string;
}

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    logWarn('email.skipped', {
      reason: 'no_api_key',
      to: Array.isArray(args.to) ? args.to.length + ' recipients' : '1 recipient',
      subject: args.subject,
    });
    return { ok: false, skipped: true };
  }
  try {
    const result = await client.emails.send({
      from: RESEND_FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    if (result.error) {
      logError(result.error, { route: 'email.send' });
      return { ok: false };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    logError(err, { route: 'email.send' });
    return { ok: false };
  }
}

// ── Templates ───────────────────────────────────────────────────────────────

function htmlShell(body: string): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f9faf6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1c1a;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f9faf6;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #e2e3e0;padding:32px;">
          <tr><td>
            <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#012d1d;margin-bottom:24px;">Missão Amazônica – Sal da Terra</div>
            ${body}
            <hr style="border:none;border-top:1px solid #e2e3e0;margin:32px 0 16px;" />
            <p style="font-size:12px;color:#717973;margin:0;">Este e-mail foi enviado automaticamente. Para questões financeiras, responda diretamente.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export async function sendDonationIntentCreated(args: {
  to: string;
  donorName?: string | null;
  itemTitle: string;
  amountCents: number;
  pixPayload: string;
}): Promise<SendResult> {
  const greeting = args.donorName ? `Olá ${args.donorName.split(' ')[0]},` : 'Olá,';
  const body = `
    <h1 style="font-size:24px;color:#012d1d;margin:0 0 16px;">Sua intenção de doação foi registrada</h1>
    <p style="line-height:1.6;color:#414844;">${greeting} obrigado por apoiar a campanha <strong>${args.itemTitle}</strong>!</p>
    <p style="line-height:1.6;color:#414844;">Valor: <strong>${formatBRL(args.amountCents)}</strong></p>
    <p style="line-height:1.6;color:#414844;">Para concluir, copie o código Pix abaixo no app do seu banco:</p>
    <pre style="background:#f3f4f1;padding:16px;border-radius:8px;font-size:11px;word-break:break-all;white-space:pre-wrap;color:#1a1c1a;">${args.pixPayload}</pre>
    <p style="line-height:1.6;color:#414844;font-size:13px;">A confirmação é registrada automaticamente quando o banco da missão recebe o valor.</p>
  `;
  return sendEmail({
    to: args.to,
    subject: 'Sua intenção de doação · Missão Amazônica',
    html: htmlShell(body),
  });
}

export async function sendDonationConfirmed(args: {
  to: string;
  donorName?: string | null;
  itemTitle: string;
  amountCents: number;
}): Promise<SendResult> {
  const greeting = args.donorName ? `Olá ${args.donorName.split(' ')[0]},` : 'Olá,';
  const body = `
    <h1 style="font-size:24px;color:#012d1d;margin:0 0 16px;">Doação confirmada · Obrigado!</h1>
    <p style="line-height:1.6;color:#414844;">${greeting} sua doação de <strong>${formatBRL(args.amountCents)}</strong> para a campanha <strong>${args.itemTitle}</strong> foi confirmada.</p>
    <p style="line-height:1.6;color:#414844;">Acompanhe a aplicação dos recursos na nossa página pública de prestação de contas.</p>
    <p style="margin:24px 0;"><a href="${import.meta.env.PUBLIC_SITE_URL ?? 'https://missaoamazonica.org'}/prestacao-de-contas" style="display:inline-block;background:#1b4332;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Ver prestação de contas</a></p>
  `;
  return sendEmail({
    to: args.to,
    subject: 'Doação confirmada · Missão Amazônica',
    html: htmlShell(body),
  });
}

export async function sendAdminPendingReview(args: {
  to: string;
  intentId: string;
  itemTitle: string;
  amountCents: number;
}): Promise<SendResult> {
  const body = `
    <h1 style="font-size:24px;color:#012d1d;margin:0 0 16px;">Doação aguardando verificação manual</h1>
    <p style="line-height:1.6;color:#414844;">Uma nova intenção foi gerada para <strong>${args.itemTitle}</strong> no valor de <strong>${formatBRL(args.amountCents)}</strong>.</p>
    <p style="line-height:1.6;color:#414844;">Confirme manualmente após validar o depósito bancário no painel administrativo.</p>
    <p style="margin:24px 0;"><a href="${import.meta.env.PUBLIC_SITE_URL ?? 'https://missaoamazonica.org'}/admin/donations" style="display:inline-block;background:#1b4332;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Abrir painel</a></p>
    <p style="font-size:12px;color:#717973;">ID: ${args.intentId}</p>
  `;
  return sendEmail({
    to: args.to,
    subject: '[Admin] Doação aguardando verificação · Missão Amazônica',
    html: htmlShell(body),
  });
}

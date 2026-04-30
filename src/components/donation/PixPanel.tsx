import { useEffect, useState } from 'react';
import { formatBRL } from '@/lib/format/currency';

interface IntentResponse {
  intentId: string;
  txid: string;
  payload: string;
  qrDataUrl: string;
  expiresAt: string;
  providerId: 'bank_pix' | 'manual' | 'mercado_pago' | 'asaas';
}

interface PixPanelProps {
  intent: IntentResponse;
  amountCents: number;
  itemTitle: string;
  onReset?: () => void;
}

type Status = 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'failed';

const POLL_MS = 5000;
const MAX_POLL_DURATION_MS = 30 * 60_000;

export function PixPanel({ intent, amountCents, itemTitle, onReset }: PixPanelProps) {
  const [status, setStatus] = useState<Status>('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    async function poll() {
      while (!cancelled && Date.now() - start < MAX_POLL_DURATION_MS) {
        try {
          const res = await fetch(`/api/donations/status?intentId=${intent.intentId}`);
          const data = (await res.json()) as { status?: Status };
          if (cancelled) return;
          if (data.status && data.status !== status) {
            setStatus(data.status);
          }
          if (data.status === 'confirmed' || data.status === 'expired' || data.status === 'cancelled') {
            return;
          }
        } catch {
          // network blip — retry next iteration
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [intent.intentId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(intent.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <header className="flex flex-col gap-1 text-center">
        <span className="type-caption text-on-surface-variant uppercase tracking-wider">
          Doação para {itemTitle}
        </span>
        <span className="font-display type-h2 text-primary-container">
          {formatBRL(amountCents)}
        </span>
        {status === 'pending' && (
          <span className="type-label text-secondary">Aguardando pagamento…</span>
        )}
        {status === 'confirmed' && (
          <span className="type-label text-secondary font-semibold">
            Pagamento confirmado · Obrigado por contribuir!
          </span>
        )}
        {(status === 'expired' || status === 'cancelled' || status === 'failed') && (
          <span className="type-label text-error font-semibold">
            Doação não confirmada. Tente novamente.
          </span>
        )}
      </header>

      {status === 'pending' && (
        <>
          <div className="flex justify-center">
            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
              <img
                src={intent.qrDataUrl}
                alt="QR Code Pix da doação"
                width={224}
                height={224}
                className="size-56"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 border border-secondary text-secondary type-label rounded-lg hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? 'Código copiado!' : 'Copiar código Pix copia-e-cola'}
          </button>

          <details className="bg-surface-container-low rounded-lg p-md">
            <summary className="cursor-pointer type-label text-on-surface-variant">
              Ver código Pix completo
            </summary>
            <pre className="mt-sm type-caption text-on-surface-variant whitespace-pre-wrap break-all bg-surface-container-lowest p-sm rounded-md border border-outline-variant/30">
              {intent.payload}
            </pre>
          </details>

          {intent.providerId === 'manual' && (
            <p className="type-caption text-on-surface-variant bg-surface-container-low rounded-lg p-md">
              <strong>Confirmação manual</strong>: o banco da missão ainda não está
              integrado por API/webhook. Após o pagamento, a equipe financeira
              validará o depósito e a doação aparecerá na prestação de contas.
            </p>
          )}
        </>
      )}

      {status === 'confirmed' && (
        <div className="text-center bg-secondary-container/50 text-on-secondary-container p-md rounded-lg">
          <p className="type-body">Sua contribuição já foi registrada na prestação de contas.</p>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="type-caption text-on-surface-variant hover:text-primary-container underline mt-sm self-center"
      >
        {status === 'pending' ? 'Cancelar e doar outro valor' : 'Fazer nova doação'}
      </button>
    </div>
  );
}

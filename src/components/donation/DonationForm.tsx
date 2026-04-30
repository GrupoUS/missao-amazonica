import { useState, useTransition, type FormEvent } from 'react';
import { CreateDonationIntentSchema } from '@/lib/validators/donation';
import { parseBRLToCents, formatBRL } from '@/lib/format/currency';
import { PixPanel } from './PixPanel';

interface DonationFormProps {
  itemId: string;
  itemTitle: string;
  suggestedCents?: number[];
}

interface IntentResponse {
  intentId: string;
  txid: string;
  payload: string;
  qrDataUrl: string;
  expiresAt: string;
  providerId: 'bank_pix' | 'manual' | 'mercado_pago' | 'asaas';
}

const DEFAULT_SUGGESTED = [3000, 5000, 10000, 25000, 50000];

export function DonationForm({
  itemId,
  itemTitle,
  suggestedCents = DEFAULT_SUGGESTED,
}: DonationFormProps) {
  const [amountInput, setAmountInput] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [displayConsent, setDisplayConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectSuggested = (cents: number) => {
    setAmountInput(formatBRL(cents).replace('R$', '').trim());
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const amountCents = parseBRLToCents(amountInput);
    if (amountCents == null || amountCents < 100) {
      setError('Informe um valor de no mínimo R$ 1,00.');
      return;
    }

    const payload = {
      itemId,
      amountCents,
      donorName: isAnonymous ? '' : donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: donorPhone.trim(),
      isAnonymous,
      displayNamePubliclyConsent: isAnonymous ? false : displayConsent,
    };

    const parsed = CreateDonationIntentSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/donations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });
        const data = (await res.json()) as IntentResponse | { error: string; code: string };
        if (!res.ok) {
          setError(
            'error' in data
              ? data.error
              : 'Não foi possível gerar o Pix. Tente novamente.',
          );
          return;
        }
        setIntent(data as IntentResponse);
      } catch {
        setError('Falha de conexão. Verifique sua internet e tente novamente.');
      }
    });
  };

  if (intent) {
    return (
      <PixPanel
        intent={intent}
        amountCents={parseBRLToCents(amountInput) ?? 0}
        itemTitle={itemTitle}
        onReset={() => {
          setIntent(null);
          setAmountInput('');
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-md" noValidate>
      <fieldset className="flex flex-col gap-sm">
        <legend className="type-label text-on-surface-variant mb-1">
          Valor da doação
        </legend>
        <div className="flex flex-wrap gap-2">
          {suggestedCents.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => handleSelectSuggested(cents)}
              className="px-3 py-2 rounded-lg border border-outline-variant text-on-surface bg-surface-container-lowest type-label hover:border-secondary hover:text-secondary transition-colors"
            >
              {formatBRL(cents)}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant type-body">
            R$
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full bg-surface-container-low border border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg py-3 pl-12 pr-4 type-body text-on-surface outline-none transition-colors"
            required
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-sm">
        <label className="flex items-center gap-sm type-label text-on-surface-variant cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => {
              setIsAnonymous(e.target.checked);
              if (e.target.checked) setDisplayConsent(false);
            }}
            className="size-4 rounded border-outline-variant text-secondary focus:ring-secondary"
          />
          Doar anonimamente (não armazenamos seu nome publicamente)
        </label>

        {!isAnonymous && (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="donorName" className="type-label text-on-surface-variant">
                Nome <span className="text-on-surface-variant/60">(opcional)</span>
              </label>
              <input
                id="donorName"
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                maxLength={120}
                className="w-full bg-surface-container-low border border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg py-2 px-3 type-body outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="donorEmail" className="type-label text-on-surface-variant">
                E-mail <span className="text-on-surface-variant/60">(para recibo, opcional)</span>
              </label>
              <input
                id="donorEmail"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                maxLength={254}
                className="w-full bg-surface-container-low border border-transparent focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg py-2 px-3 type-body outline-none transition-colors"
              />
            </div>
            <label className="flex items-start gap-sm type-caption text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                checked={displayConsent}
                onChange={(e) => setDisplayConsent(e.target.checked)}
                className="mt-0.5 size-4 rounded border-outline-variant text-secondary focus:ring-secondary"
                disabled={!donorName.trim()}
              />
              <span>
                Autorizo exibir meu primeiro nome na lista pública de doadores deste projeto.
                Em conformidade com a LGPD, esta autorização pode ser revogada a qualquer momento.
              </span>
            </label>
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-error-container text-on-error-container px-md py-sm rounded-lg type-label"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary-container text-on-primary py-3 rounded-lg type-label font-semibold shadow-cta hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? 'Gerando Pix…' : 'Gerar QR Code Pix'}
      </button>

      <p className="type-caption text-on-surface-variant text-center">
        Pagamento processado via Pix. Você receberá o QR Code e o código copia-e-cola
        ao gerar a intenção. A confirmação é registrada quando o banco da missão recebe
        o valor.
      </p>
    </form>
  );
}

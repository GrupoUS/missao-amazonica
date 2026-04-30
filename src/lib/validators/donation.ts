import { z } from 'zod';

export const CreateDonationIntentSchema = z
  .object({
    itemId: z.string().uuid('ID de item inválido'),
    amountCents: z
      .number({ message: 'Informe um valor válido' })
      .int('Valor deve ser inteiro em centavos')
      .min(100, 'Valor mínimo é R$ 1,00')
      .max(100_000_000, 'Valor máximo é R$ 1.000.000,00'),
    donorName: z
      .string()
      .trim()
      .max(120, 'Nome muito longo')
      .optional()
      .or(z.literal('')),
    donorEmail: z
      .string()
      .trim()
      .max(254)
      .email('E-mail inválido')
      .optional()
      .or(z.literal('')),
    donorPhone: z.string().trim().max(30).optional().or(z.literal('')),
    isAnonymous: z.boolean().default(false),
    displayNamePubliclyConsent: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    if (val.displayNamePubliclyConsent && !val.donorName) {
      ctx.addIssue({
        code: 'custom',
        path: ['donorName'],
        message: 'Para exibir publicamente, informe seu nome.',
      });
    }
    if (val.isAnonymous && val.displayNamePubliclyConsent) {
      ctx.addIssue({
        code: 'custom',
        path: ['displayNamePubliclyConsent'],
        message: 'Doação anônima não pode exibir nome publicamente.',
      });
    }
  });

export type CreateDonationIntentInput = z.infer<typeof CreateDonationIntentSchema>;

export const DonationStatusQuerySchema = z.object({
  intentId: z.string().uuid(),
});

export type DonationStatusQuery = z.infer<typeof DonationStatusQuerySchema>;

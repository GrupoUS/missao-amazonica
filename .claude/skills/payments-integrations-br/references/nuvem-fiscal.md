# Nuvem Fiscal — Integration Reference

> Source: https://dev.nuvemfiscal.com.br — researched 2026-04-01

## Authentication

Bearer token from dashboard (not OAuth — static token per environment):

```typescript
headers: { 'Authorization': `Bearer ${env.NUVEM_FISCAL_TOKEN}` }
```

| Env Var | Environment | Notes |
|---------|-------------|-------|
| `NUVEM_FISCAL_TOKEN` | Production | Sends to SEFAZ producao |
| `NUVEM_FISCAL_TOKEN_SANDBOX` | Sandbox | Sends to SEFAZ homologacao |
| `NUVEM_FISCAL_BASE_URL` | Both | Switch per environment |

**Never mix sandbox token with production endpoint** — documents emitted in wrong environment are invalid.

## Environments

| Environment | SEFAZ Target | Notes |
|-------------|-------------|-------|
| Sandbox | Homologacao (test) | Baseline: ~100 events. Contact support to increase. |
| Production | Producao (live) | Confirm rate limits with Nuvem Fiscal support before go-live |

Budget 2-4 weeks for sandbox limit increase if volume testing at scale.

## Emission Flow (NFe / NFSe)

```
1. Validate data locally (CNPJ/CPF, address, items)
2. POST /nfe or /nfse with document data
3. Store returned chaveAcesso IMMEDIATELY
4. Poll status if emission is async
5. Handle SEFAZ rejections (structured codes)
```

### Idempotency Pattern

Check for existing `chaveAcesso` before emitting to prevent duplicates:

```typescript
async function emitNFe(docData: NFeInput): Promise<string> {
  // 1. Check if already emitted using internal reference
  const existing = await db.query.notasFiscais.findFirst({
    where: eq(notasFiscais.internalRef, docData.internalRef),
  });
  if (existing?.chaveAcesso) return existing.chaveAcesso;

  // 2. Validate before sending (fail fast, SEFAZ rejections are not retryable without fix)
  validateNFeData(docData); // throws on invalid CNPJ, missing required fields

  // 3. Emit
  const res = await fetch(`${env.NUVEM_FISCAL_BASE_URL}/nfe`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.NUVEM_FISCAL_TOKEN}` },
    body: JSON.stringify(docData),
    signal: AbortSignal.timeout(15_000), // NFe emission can be slow
  });

  const result = await res.json();

  // 4. Store chaveAcesso immediately — required for cancellation and queries
  await db.insert(notasFiscais).values({
    internalRef: docData.internalRef,
    chaveAcesso: result.chaveAcesso,
    emittedAt: new Date(),
  });

  return result.chaveAcesso;
}
```

## SEFAZ Rejection Codes

| Code | Description | Action |
|------|-------------|--------|
| 539 | CNPJ inválido | Validate CNPJ before retry |
| 538 | CPF inválido | Validate CPF before retry |
| 204 | Duplicidade de NF-e | Document already exists in SEFAZ — check `chaveAcesso` |
| 999 | Erro interno SEFAZ | Retry with exponential backoff |
| 594 | Rejeicao: Numero NF anterior nao emitida | Correct emission sequence |

**Distinguish error types:**
- **Hard rejections** (invalid data: 539, 538, etc.): Do NOT retry without fixing data
- **Soft errors** (SEFAZ unavailable: 999): Retry with exponential backoff
- **Duplicates** (204): Fetch existing `chaveAcesso`, do not re-emit

```typescript
function isSefazRetryable(code: number): boolean {
  // Soft errors (transient SEFAZ issues)
  return [999, 109, 108].includes(code);
}
```

## Error Handling Rules

- Never silently swallow emission failures — always log the full SEFAZ rejection reason
- Store rejection reason in DB alongside the failed emission attempt
- User-facing message must not expose raw SEFAZ codes — map to human-readable messages

## Rate Limits

Per-endpoint limits not publicly documented. Assume conservative limits:
- Add `AbortSignal.timeout(15_000)` (NFe emission is slower than typical REST)
- Implement exponential backoff for `429` / `503`
- Contact Nuvem Fiscal support for production SLA before go-live

## chaveAcesso (Access Key)

The `chaveAcesso` (44-digit key) is the primary identifier for any fiscal document in SEFAZ.

- Store immediately after emission — if lost, recovery requires SEFAZ query
- Required for: cancellation, XML download, status queries, customer invoices
- Format: `{cUF}{AAMM}{CNPJ}{mod}{serie}{nNF}{tpEmis}{cNF}{cDV}` (44 digits)

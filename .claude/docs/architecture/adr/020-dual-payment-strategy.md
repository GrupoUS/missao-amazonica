# ADR-020: Dual Payment Gateway Strategy (Stripe + ASAAS)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash serves Brazilian businesses that need both international payment processing (subscriptions, credit cards) and Brazilian-specific payment methods (PIX, boleto bancário). No single gateway covers both well for the Brazilian market. Options: (A) Stripe only, (B) ASAAS only, (C) Stripe + ASAAS simultaneously.

Stripe is the industry standard for subscription billing with excellent webhook infrastructure. ASAAS is a Brazilian gateway supporting PIX (instant payment), boleto, and local compliance.

## Decision

Maintain both Stripe and ASAAS simultaneously. Stripe is primary for subscription management and webhook-driven billing events. ASAAS handles Brazilian payment method sync (PIX, boleto) and local invoice requirements. Webhooks for both are verified and processed by separate route handlers.

## Consequences

**Positive:**
- Full Brazilian payment coverage (PIX + boleto via ASAAS, cards + subscriptions via Stripe)
- Stripe's webhook reliability ensures subscription state is always current
- Mentorados can choose their preferred payment method

**Negative / Trade-offs:**
- Two payment gateways to integrate, maintain, and debug
- Payment status must be reconciled across two systems
- Double the webhook verification complexity

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Stripe only | Single integration, best subscription tooling | PIX and boleto support is limited/expensive in Brazil via Stripe | Rejected: Brazilian payment method gap |
| B — ASAAS only | Full Brazilian payment coverage | No subscription management matching Stripe's quality, weaker webhook infrastructure | Rejected: subscription management gap |
| C — Stripe + ASAAS | Full coverage, Stripe subscriptions + Brazilian methods | Two gateways to maintain | **Chosen** |

## Related ADRs

- [ADR-006](006-multi-tenant-mentorado-isolation.md) — All payment records are scoped by mentoradoId

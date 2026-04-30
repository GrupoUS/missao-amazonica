---
globs: apps/api/src/services/**
---

# Integration Rules (Tier 2 — Auto-loaded)

> Compact operational guardrails for external provider work.
> Canonical implementation authority: `apps/api/src/services/AGENTS.md`
> Deep architecture references: `.claude/docs/architecture/09-integration-map.md`, `.claude/docs/architecture/11-runtime-environment.md`, `.claude/docs/architecture/13-backend-learnings.md`

## Intent

This rule stays intentionally slim so it can auto-load without bloating context.

- Use this file for **immediate integration guardrails**
- Load architecture references **only when the task needs deeper provider detail**
- Load `apps/api/src/services/AGENTS.md` **only when editing files in that subtree**

---

## Universal Rules

- Every external API call must use a timeout
- Never read secrets directly from scattered env access when a config/env module exists
- Never hardcode provider versions, base URLs, tokens, or credentials
- Log integration failures with structured context, not ad hoc console output
- Webhook receivers must acknowledge quickly and avoid long synchronous processing
- Idempotency is mandatory for webhook/event ingestion
- Treat provider payloads as untrusted input: validate before processing
- Prefer explicit retry/backoff behavior over implicit repeated calls
- Keep provider response contracts stable; adapt at the consumer boundary when possible

---

## Provider Guardrails

### Meta / WhatsApp / Instagram

- Validate inbound webhook authenticity on every request
- Return success quickly, then process asynchronously
- Deduplicate inbound message/event delivery
- Check token expiry before using stored OAuth credentials
- Never assume optional expiry fields are always present

### Baileys

- Do not reconnect in a tight synchronous loop
- Different disconnect reasons require different recovery actions
- Handle both legacy and newer connection identity paths where the codebase supports both
- Normalize Brazilian phone numbers consistently before matching or persisting

### Stripe / ASAAS / Kiwify / Hubla

- Treat webhook idempotency as a first-class persistence concern
- Separate sandbox and production credentials
- Map provider event types to explicit internal state transitions
- Do not let billing-side retries create duplicated internal effects

### Google / Resend / Nuvem Fiscal

- Use minimum required scopes/permissions
- Distinguish retryable failures from hard validation failures
- Persist external correlation identifiers needed for follow-up queries or cancellation flows
- Never swallow provider rejection reasons

---

## Load More Context Only When Needed

| Need | Load |
|------|------|
| System/provider topology | `.claude/docs/architecture/09-integration-map.md` |
| Env vars, runtime config, token context | `.claude/docs/architecture/11-runtime-environment.md` |
| Historical backend pitfalls affecting integrations | `.claude/docs/architecture/13-backend-learnings.md` |
| Service-specific implementation patterns | `apps/api/src/services/AGENTS.md` |

---

## When This Rule Is Enough

This file alone is usually enough for:

- small integration fixes
- webhook safety checks
- timeout/idempotency verification
- quick provider-side guardrail reminders

Load deeper references only for:

- token lifecycle changes
- provider onboarding
- architecture decisions
- multi-provider data flows
- non-obvious historical bug families

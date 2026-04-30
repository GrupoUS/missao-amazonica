# ADR-021: Google Gemini as AI Model Provider for All 6 Agent Types

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash's AI Gateway runs 6 specialized agents (SDR, Marketing, Patient, Financial, Severino, Widget). A model provider must be chosen for inference. Options considered: (A) OpenAI GPT-4/4o, (B) Anthropic Claude, (C) Google Gemini, (D) Multi-provider (different models per agent).

Key requirements: Portuguese language quality (Brazilian Portuguese for all prompts and responses), cost efficiency for high-volume inference (6 agents × multiple tenants), long context window (agent history), and SDK compatibility.

## Decision

Use Google Gemini (`gemini-2.0-flash`) as the exclusive AI model provider for all agents. Access via `@google/genai` SDK (Google's official SDK) and `@ai-sdk/google` (Vercel AI SDK adapter). The Vercel AI SDK provides a unified streaming interface for SSE responses.

## Consequences

**Positive:**
- `gemini-2.0-flash` provides excellent Brazilian Portuguese quality at lower cost than GPT-4
- Long context window handles extended agent conversation history
- `@google/genai` + Vercel AI SDK provides streaming support for SSE chat responses
- Single provider simplifies API key management and cost tracking

**Negative / Trade-offs:**
- Single provider dependency — Google Gemini outage affects all agents
- Less community resources and fine-tuning options than OpenAI
- Switching providers later would require updating all 6 agent prompt formats

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — OpenAI GPT-4/4o | Best community resources, most capable | Higher cost per token, GPT models slightly weaker on Portuguese | Rejected: cost and Portuguese quality |
| B — Anthropic Claude | Strong reasoning, long context | No official streaming adapter in Vercel AI SDK at time of decision | Rejected: SDK integration complexity |
| C — Google Gemini | Excellent Portuguese, cost-efficient, Vercel AI SDK support | Google dependency | **Chosen** |
| D — Multi-provider (per agent) | Best model per task | Complex key management, inconsistent prompt formats, debugging complexity | Rejected: operational complexity |

## Related ADRs

- [ADR-002](002-embedded-ai-gateway.md) — All 6 Gemini-powered agents run in the embedded AI Gateway
- [ADR-007](007-redis-dual-purpose.md) — Gemini agent responses are coordinated via Redis pub/sub inter-agent communication

# Build Progress — NeonDash

> **Agent instruction:** Update this file after completing each feature phase.
> Format: `- [x] Phase name — completed YYYY-MM-DD (commit: <short-sha>)`
> Move items from "In Progress" to "Completed" only when all quality gates pass
> (see `.claude/docs/quality-gates.md § Commit Agent Protocol`).

---

## Features In Progress

<!-- Agent: add new features here when work begins. Format:
### Feature Name
- [ ] Phase 1 — [status]
- [ ] Phase 2 — [status]
-->

### Structured patient consultations
- [ ] Phase 1 — Schema/API/UI/import-export implementation in progress — started 2026-04-28 (commit: pending)
- [x] PR #94 review fixes — CSV/parser/template/security/consent mapping audit completed 2026-04-28 (commit: pending)
- [x] Verification comments — consent source-of-truth, lifecycle state, duplicate import resolution, and datetime-local audit fixes completed 2026-04-28 (commit: pending)

### Agenda + Google Calendar sync stabilization
- [x] Phase A — Backend: token-refresh narrowing (D5), TRPCError `cause.code` propagation (D3), `lastSyncAt` write + `getStatus` exposure (D9, D4) — completed 2026-04-28 (commit: pending; base 7a83a82e)
- [x] Phase B — Frontend: derive `calendarRange` from controlled `view`/`date` (D1), `staleTime`/`gcTime` (D6), `error.data.appCode` branching (D3), multi-day clamp toast (D7), `isAllDay` from view (D8), real `lastSyncAt` UI (D4), local-date string helper (D2 form-default) — completed 2026-04-28 (commit: pending)
- [x] Phase C — Tests: `agenda-time` unit tests (10), tRPC errorFormatter `appCode` round-trip (2). Full suite green (api 861, web 238) — completed 2026-04-28 (commit: pending)
- [x] Phase D — Docs: `AUDIT-agenda-google-calendar.md`, `RUNBOOK-google-calendar-sync.md`, `REGRESSION-CHECKLIST-agenda.md` — completed 2026-04-28 (commit: pending)
- [x] Review pass — C1 calendar-aware mutations (writer/owner gating + per-event calendarId routing through service/router/frontend), C2 shared `google-token-service` adopted by `mentor.ts` and `ai-assistant-service.ts`, C3 robust `parseGoogleEventDates` (drop cancelled/unrecoverable, synthesize fallback end), C4 behavioral tests for token-refresh + fan-out (16 new). Full suite green (api 877, web 238) — completed 2026-04-28 (commit: pending)

### Collaborator quota + invite-email reliability
- [ ] Phase 10 — Staging probe via Playwright MCP — pending Coolify deploy

### Global AI Model Orchestration
- [x] Sprint 1 — Schema (`ai_model_config` + enums), `@neondash/ai-orchestrator` package with adapters (Gemini / Z.ai GLM / Kilo Gateway / OpenAI), pre-flight fallback algorithm, 9 unit tests passing — completed 2026-04-28 (commit: pending)
- [x] Sprint 2 — Env vars (`Z_AI_API_KEY`, `KILO_API_KEY`, `OPENAI_API_KEY`, `AI_ORCHESTRATOR_DISABLED`), `aiModelConfig` tRPC router (adminProcedure list/upsert/reorder/toggle/remove), idempotent seed of GLM 5.1 → Kilo Auto Free → Gemini 3.1 chain + Nano Banana → GPT-Image-2, `getOrchestrator()` singleton — completed 2026-04-28 (commit: pending)
- [x] Sprint 3 — Admin UI at `/dashboard/admin/settings/ai-models` with dnd-kit reorderable list per modality, registry-driven add dialog, role-gated route — completed 2026-04-28 (commit: pending)
- [ ] Sprint 4 — Wire main-app consumer surfaces (`ai-assistant-service`, `patient-ai-service`, `marketing-service`, `workspace/ai`, `ai-gateway/LLMService`) through orchestrator. Deferred: requires Vercel-AI-SDK-compatible `LanguageModel` adapter to preserve tool-calling. v1 keeps direct Gemini paths; admin UI controls primary model selection only.
- [ ] Sprint 5 — Integration test, architecture map update — partial (env.example, progress entry, AGENTS.md package register done)

---

## Completed Features

### Codex CLI statusline
- [x] Project footer — configured `.codex/config.toml` `tui.status_line` to mirror Claude model/dir/branch/context visibility with Codex-native fields — completed 2026-04-29 (commit: 7cdebbbd)

### PR #97 dev-test review fixes
- [x] Review comments — react-international-phone dropdown focus token corrected in global CSS and contrast plan doc aligned with PR implementation — completed 2026-04-29 (commit: 53ce00ef)

### PR #95 dev-test review fixes
- [x] Review comments — avatar upload audit, lead custom-field/qualification tests, patient dialog reset/medical clearing, and plan doc contract alignment — completed 2026-04-29 (commit: 2cf18313)

### Collaborator quota + invite-email reliability
- [x] Phase 1 — Audit (Clerk-only invite delivery, no observability, resendInvite no-op) — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 2 — Schema: `billing_accounts` +5 cols, `mentorado_team_members` +5 cols + 2 indexes (`bun run db:push`) — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 3 — `COLLABORATOR_QUOTA` constant + helpers in `@neondash/shared/plans` + `collaborator-quota-service.ts` (lock-aware `assertCanInviteCollaborator`) — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 4 — `sendCollaboratorInvitationEmail` in email-service + `inviteMember`/`resendInvite` rewrite (atomic seat reservation tx + Clerk + Resend hybrid + per-row delivery state) — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 5 — Stripe extra-collab add-on (live: `prod_UPdhPO8CqzGuxK`/`price_1TQoQEKjGoeWDsVpbeLc4ts3`, R$ 97,00 BRL recurring monthly) + `purchaseCollaboratorBlock` + webhook quantity projection — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 6 — RBAC: defense-in-depth tenant filter on `atividades-router.ts:toggleStep` UPDATE — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 7 — Frontend: usage badge + limit-reached CTA on team page, `ExtraCollaboratorsCard` on billing page — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 8 — Tests: +14 quota-math cases in `plans.test.ts`, +4 cases in `collaborator-quota-service.test.ts` — completed 2026-04-27 (commit: b63e6803)
- [x] Phase 9 — Validation gates green (biome, oxlint 0/0, tsgo 5/5, vitest api 852/852 + shared 56/56) — completed 2026-04-27 (commit: b63e6803)
- [x] CLI orchestrator — `scripts/setup_collaborator_billing.py` (Stripe API + Resend domain check + Clerk sanity + Coolify env push, idempotent, `--apply`/`--apply-coolify`/`--write-dotenv`) — completed 2026-04-27 (commit: b63e6803)
- [x] Simplify pass — enum for `inviteEmailStatus`, parallelize Clerk+Resend, lock-merge in quota service, drop redundant `auth.me` invalidation, replace `* 9700` with `COLLABORATOR_QUOTA` constants — completed 2026-04-27 (commit: 332387b7)
- [x] Review pass (PR #93 Copilot) — quota guard on `resendInvite` reactivation, ownership check + active-subscription gate on `purchaseCollaboratorBlock`, reset `collaboratorExtraBlocks=0` on `subscription.deleted`, fail-fast `COOLIFY_TOKEN`, clearer Resend email copy — completed 2026-04-27 (commit: pending)

### Nuvem Fiscal OAuth2 Migration (env + DB paths)
- [x] Phase 1 — env schema + OAuth token manager + DB config router OAuth support — completed 2026-04-15 (commit: pending)
- [x] Phase 2 — `docker-compose.deploy.yml` env wiring + `apps/api/.env.example` template — completed 2026-04-15 (commit: pending)
- [x] Phase 3 — frontend config card + settings page copy — completed 2026-04-15 (commit: pending)
- **Manual follow-up (user):** rotate exposed credentials, set fresh values in Coolify (staging + prod), redeploy, run live `testConnection` probe.

---

## Blocked / Deferred

<!-- Items paused due to dependency, decision needed, or deprioritized.
Include blocker reason and owner. Format:
### Feature Name
- **Blocker:** [reason]
- **Owner:** [who is unblocking]
- **Since:** YYYY-MM-DD
-->

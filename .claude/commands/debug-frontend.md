---
description: Frontend debug + E2E browser testing. Combines static React/UI analysis with Playwright MCP browser automation for full journey testing.
workflow_type: prompt-chaining
---

# /debug-frontend — Frontend Debug + E2E Browser Testing

**ARGUMENTS**: $ARGUMENTS

> Unifies React/UI static analysis with E2E browser testing via Playwright MCP.

**Iron Laws:**
```
NO FIXES WITHOUT STATIC DIAGNOSIS + VISUAL EVIDENCE FIRST.
NO INTERACTION WITHOUT A SNAPSHOT BEFORE IT.
NO FIX WITHOUT A SNAPSHOT OR SCREENSHOT AS EVIDENCE.
NO FIX WITHOUT A PASSING VITEST REPRODUCTION TEST.
```

---

## 0. FIRST ACTION

```typescript
Skill("debugger"); // Iron Law + 4-phase methodology + frontend pack
```

Run `/prime-frontend` to load frontend context.

---

## 1. Quality Gates Baseline

Run before browser testing — catch type/logic errors cheaply first:

```bash
bun run test --project client  # Frontend Vitest suite (jsdom) — fast, catches logic errors
bun run type-check             # TypeScript (tsgo, ~4s)
bun run lint:oxlint:check      # Lint baseline
```

Only proceed to browser testing if Vitest passes. Fixing unit failures is cheaper than debugging via Playwright.

---

## Phase Pre-0: Static Diagnosis (Parallel)

Before browser testing, run parallel static investigation:

**Agent 1 (frontend-specialist):** Static frontend diagnostics
- Analyze component tree, hooks, rerender triggers
- Identify token/layout issues, shadcn state/control problems
- Detect flickering, unstable rerenders, key warnings
- Scope: `$ARGUMENTS`
- Return: problematic files with line + root cause hypothesis. DO NOT FIX.

**Agent 2 (debugger):** Frontend-backend integration check
- Verify tRPC query/mutation paths used by the frontend
- Identify silent failures, latency issues, suspense interactions
- Check mutations have try-catch wrapping (stability rule J)
- Check post-mutation cache invalidation
- Return: procedures with potential issues + hypothesis. DO NOT FIX.

Spawn both with `run_in_background: true` in the same message.

---

## Phase 0: Route Discovery (Parallel)

Spawn 2 `explorer` agents in background to map routes and coverage:

**Agent 1:** Map all routes and user journeys
- Read `routes/` directory recursively
- List all routes: path, component, functionality
- Identify critical user flows (auth, CRUD, integrations, settings)
- List expected interactions per flow (clicks, forms, modals)
- Scope: `$ARGUMENTS` (if provided, focus on that scope)
- Return: route table + prioritized user journeys

**Agent 2:** Map existing E2E coverage and gaps
- Read all test files in `e2e/` directory
- For each test: routes covered, assertions, interactions tested
- Cross-reference with route list
- Identify routes/flows WITHOUT E2E coverage
- Return: coverage table (route | tested? | file | quality) + gaps list

---

## Phase 1: Browser Session Setup

Determine target URL and open browser:

```
Target URL resolution:
  - Default: use project staging URL per AGENTS.md Browser QA section
  - Override: /debug-frontend url=http://localhost:5173

Open via Playwright MCP:
  mcp__playwright__browser_navigate({ url: TARGET_URL })
  mcp__playwright__browser_snapshot()             # Accessibility baseline (120 tokens, 4x cheaper than screenshot)
  mcp__playwright__browser_console_messages()     # Check for pre-existing JS errors
```

---

## Phase 2: Journey Task Creation

Create a trackable task for each critical journey found in Phase 0:

Priority order:
1. Auth flow — login, redirect, session persistence
2. Main dashboard — KPIs load, charts render
3. Critical CRUD — create/edit/delete primary entities
4. Integrations — configuration pages, connection status
5. Responsiveness — mobile viewport (375x667) on above flows

---

## Phase 3: Journey Testing Loop

For EACH journey, execute this cycle:

```
1. Navigate: mcp__playwright__browser_navigate({ url: ROUTE_URL })

2. Snapshot (ALWAYS before interaction — refs go stale after DOM changes):
   mcp__playwright__browser_snapshot()

3. Interact using refs from snapshot:
   mcp__playwright__browser_click({ element: "..." })
   mcp__playwright__browser_fill({ element: "...", value: "test data" })

4. Wait for stabilization:
   mcp__playwright__browser_wait_for({ text: "expected content" })

5. Capture state (prefer snapshot):
   mcp__playwright__browser_snapshot()              # default — 120 tokens, LLM-native
   mcp__playwright__browser_take_screenshot()       # visual regression only — 1500 tokens

6. Verify no errors:
   mcp__playwright__browser_console_messages()     # JS errors, warnings, tRPC failures
   mcp__playwright__browser_network_requests()     # catch failed API calls (4xx/5xx)

7. If issue found:
   a) Document: `browser_snapshot()` as evidence + `browser_console_messages()` for JS errors
   b) Write Vitest component test to reproduce at unit level:
      - Use `renderWithRouter` from `apps/web/src/test/router-test-utils.tsx`
      - Use `userEvent` (not `fireEvent`) for realistic interactions
      - Run `bun run test --project client` → must FAIL (confirms reproduction)
   c) Fix in source (Edit tool)
   d) Re-run Vitest: `bun run test --project client` → must PASS
   e) Re-test E2E: navigate → snapshot → interact → snapshot confirming fix
   f) Run quality gates: `bun run type-check && bun run lint:oxlint:check`
```

### Viewport Responsiveness

Test at least 2 viewports per critical journey:

```
Desktop: mcp__playwright__browser_resize({ width: 1280, height: 720 })
Mobile:  mcp__playwright__browser_resize({ width: 375, height: 667 })
Tablet:  mcp__playwright__browser_resize({ width: 768, height: 1024 })  # optional
```

### Verification Checklist Per Step

- [ ] Element exists and is visible (`browser_snapshot`)
- [ ] Interaction produces expected result (`browser_snapshot`)
- [ ] No JS errors: `browser_console_messages()` — catches silent errors
- [ ] No failed requests: `browser_network_requests()` — catches tRPC 4xx/5xx
- [ ] Loading states appear and disappear (skeleton/spinner)
- [ ] Visual feedback after actions (toast/alert)
- [ ] Navigation returns to correct state after action

---

## Phase 4: Report

```markdown
## E2E Test Report

**Date:** {date}
**Target URL:** {url}
**Viewports tested:** Desktop (1280x720), Mobile (375x667)

### Summary

| Metric | Value |
|--------|-------|
| Journeys tested | X |
| Screenshots captured | X |
| Issues found | X |
| Issues fixed | X |
| Issues pending | X |

### Journeys

| # | Journey | Status | Steps | Issues |
|---|---------|--------|-------|--------|

### Issues Found

| # | Severity | Journey | Step | Description | Screenshot | Status |
|---|----------|---------|------|-------------|------------|--------|

### Coverage

| Area | Total Routes | Tested | Coverage % |
|------|-------------|--------|------------|
```

---

## Phase 5: Cleanup & Quality Gates

```
mcp__playwright__browser_close()
```

Run final quality gates per `_shared.md` Section 1.

---

## Usage

```
/debug-frontend                          # Full (static + browser) on staging
/debug-frontend url=http://localhost:5173 # Local dev server
/debug-frontend scope=CRM               # Scoped to a specific feature area
```

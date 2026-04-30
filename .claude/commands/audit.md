---
description: Full-stack 9-dimension codebase audit. Spawns 4 parallel agents covering architecture, code quality, dependencies, technical debt, documentation/missing screens, and UX/tests/CI. Produces a prioritized findings report.
workflow_type: parallelization
---

# /audit — Full-Stack Critical Audit (9 Dimensions)

**ARGUMENTS**: $ARGUMENTS

> Use this for comprehensive audits. For targeted bug fixing use `/debug`.
> **PR/diff mode:** `/audit pr` — first runs `codex adversarial-review --scope branch` for an independent AI code review baseline, then covers D3 (code quality), D8 (dependencies), D9 (technical debt), and D3.5 security on changed files. Output: per-file inline feedback, no exec summary.

---

## 0. FIRST ACTION

```typescript
Skill("debugger"); // Iron Law + methodology
```

Load context: `/prime` (full-stack audit always needs all Tier 2 rules).

---

## 1. Quality Gates Baseline

Run before any analysis to capture current state:

```bash
bun run type-check 2>&1 | tail -30
bun run lint:oxlint:check 2>&1 | tail -20
bunx biome check 2>&1 | tail -20
bun run test 2>&1 | tail -30
```

Also collect metrics:

```bash
find apps/ packages/ -name "*.ts" -o -name "*.tsx" | wc -l  # Total files
find apps/ packages/ -name "*.test.ts" -o -name "*.spec.ts" | wc -l  # Test files
python -c "import subprocess; r=subprocess.run(['git','log','--oneline','-20'], capture_output=True, text=True); print(r.stdout)"
```

---

## 2. Severity Classification

| Priority | Description | Action |
|----------|-------------|--------|
| P0 | Critical — crashes, data loss, auth bypass | Fix immediately |
| P1 | Important — degraded UX, security risk | Fix this sprint |
| P2 | Moderate — technical debt, maintainability | Plan and schedule |
| P3 | Minor — readability, marginal optimization | Backlog |

---

## 3. Spawn 4 Parallel Agents (9 Dimensions)

> **Global rule for ALL agents:** DO NOT apply fixes — report only. Return findings as: `File:line | Severity (P0-P3) | Description | Rule violated | Recommendation`.

```typescript
// Agent 1: Architecture + Organization (Dimensions 1-2) — evaluator Mode 3 (architecture analysis)
Task({
  subagent_type: "evaluator",
  description: "Analyze architecture and structure",
  run_in_background: true,
  prompt: `TASK: Critical Analysis — Dimensions 1 and 2

SCOPE (if provided): $ARGUMENTS

## DIMENSION 1 — ARCHITECTURE & STRUCTURAL PATTERNS

1. Identify the architectural pattern in use (MVC, Clean Architecture, Hexagonal, Layered, etc.).
   Cite files and directories that evidence the pattern.

2. Consistency: Is the pattern applied consistently across ALL modules?
   List modules that diverge with file:line.

3. SOLID principles — identify concrete violations:
   - S: Functions/classes with multiple responsibilities
   - O: Code requiring modification to extend
   - D: Concrete dependencies instead of abstractions

4. DRY: Duplicate logic between files. Grep for repeated patterns in routers/, hooks/, components/.

5. KISS: Over-engineering — unnecessary abstractions, indirections without value.

6. Separation of concerns:
   - Business logic leaking into UI components?
   - DB queries coupled to HTTP handlers?
   - Circular imports between layers?

7. Shared contracts: Are types/interfaces defined in packages/shared/ or redefined per module?

## DIMENSION 2 — FOLDER STRUCTURE & NAMING

1. Map directory tree to 3 levels deep.

2. Naming conventions:
   - Folder names consistent (kebab-case vs camelCase)?
   - React components use PascalCase?
   - Hooks use use* consistently?
   - Routers use domain naming consistently?

3. Problems: orphan files, empty folders, duplicate structures, incomplete barrel files (index.ts),
   oversized files (>500 lines that should be split).

RETURN: standard findings format (see global rule above)`,
});

// Agent 2: Code Quality (Dimension 3)
Task({
  subagent_type: "debugger",
  description: "Analyze code quality",
  run_in_background: true,
  prompt: `TASK: Critical Analysis — Dimension 3

SCOPE (if provided): $ARGUMENTS

## DIMENSION 3 — SOURCE CODE QUALITY

### 3.1 Readability & Style
- Excessively long functions (>50 lines) with file:line
- Naming: variables, functions, interfaces should be descriptive
- Style consistency across files (biome.json + .oxlintrc.json are reference)

### 3.2 TypeScript Safety
- Search: \`as any\`, \`as unknown\`, \`!\` (non-null assertion) using grep
- Functions without explicit return types in routers and services
- \`@ts-ignore\` or \`@ts-expect-error\` without justification
- Verify stability rules: .claude/rules/stability.md (Checklist A-L)

### 3.3 Error Handling
- Mutations using generic Error instead of TRPCError with proper codes
- Empty try-catch or catch blocks that only console.log
- .returning()[0] without null guard (stability rule C)
- Unawaited promises without justification
- Frontend not wrapping mutateAsync in try-catch (stability rule J)

### 3.4 Dead Code & Duplication
- Unused exports (functions, types, constants)
- Commented-out code blocks (>3 lines)
- Duplicate functions between routers or hooks
- Unused imports

### 3.5 Security
- Hardcoded credentials: API keys, tokens, passwords in code
- .env in .gitignore?
- console.log with sensitive data (userId, email, tokens)
- dangerouslySetInnerHTML usage
- target="_blank" without rel="noopener" (stability rule K)
- CORS config (stability rule G)

### 3.8 Dependency Analysis
- Check `package.json` (and workspace `package.json` files) for:
  - Packages with known critical CVEs (cross-check against GHSA/npm audit output)
  - Outdated major versions (e.g., `"react": "^17"` when 19 is current)
  - Unused dependencies not imported anywhere in the codebase
  - Packages with restrictive licenses (GPL, AGPL) in a commercial project
  - Deprecated packages (check npm deprecation notices)
- Transitive risk: flag packages with no maintainer activity in >2 years

### 3.9 Technical Debt
- TODO / FIXME / HACK comments: count occurrences, assess severity of each
- Functions exceeding **cyclomatic complexity of 10** (count `if`, `else`, `for`, `while`, `switch`, `&&`, `||`, `??` branches) — flag file:line
- Deprecated API usage not caught by linter:
  - `React.forwardRef`, `Context.Provider`, `class` components in React 19 project
  - `!` non-null assertions (stability rule B)
  - `as any` / `as unknown as X` casts (stability rule I)
- Modernization opportunities: patterns with simpler equivalents in the current stack version
- Migration debt: commented-out migration code, feature flags never cleaned up

RETURN: standard findings format + problematic code snippet (3-5 lines)`,
});

// Agent 3: Documentation + Missing Pages/Flows (Dimensions 4-5)
Task({
  subagent_type: "debugger",
  description: "Analyze docs and missing flows",
  run_in_background: true,
  prompt: `TASK: Critical Analysis — Dimensions 4 and 5

SCOPE (if provided): $ARGUMENTS

## DIMENSION 4 — DOCUMENTATION

### 4.1 Documentation Inventory
Map all docs: README.md files, AGENTS.md files, CLAUDE.md, docs/ directory,
ADRs, JSDoc/TSDoc comments in code.

### 4.2 Documentation Quality
For each document: Is it up to date with the current code? Sufficient for a new dev?

### 4.3 Missing Documentation
- Setup and local installation guide
- API documentation (endpoints, schemas, examples)
- Architecture diagrams
- Contributing guide (CONTRIBUTING.md)
- Environment variables guide
- Operational runbooks (deploy, rollback, monitoring)

### 4.4 Code Comments
- Complex functions (>30 lines) without explanatory comments
- Abandoned TODOs/FIXMEs/HACKs
- Types without JSDoc where non-obvious

## DIMENSION 5 — MISSING PAGES, SCREENS & FLOWS

### 5.1 Route Inventory
Map all router routes (read routes/ directory recursively).
List each route: path, component, functionality.

### 5.2 Essential Missing Screens
- Error pages: 404, 500, 403 (Forbidden), maintenance mode
- Error Boundary fallback with friendly UX
- Auth flows: password recovery, email confirmation, onboarding wizard
- Destructive action confirmation dialogs
- Empty state pages with user guidance

### 5.3 Incomplete Flows
Trace each main user flow and identify gaps:
- Auth: registration → onboarding → dashboard
- CRUD: all states covered (create/edit/delete/empty)?
- Payment flow (success, failure, webhook handling)
- Integration flows (error states covered?)

RETURN: standard findings format + category (documentation/screen/flow)`,
});

// Agent 4: UX + Tests/CI (Dimensions 6-7)
Task({
  subagent_type: "frontend-specialist",
  description: "Analyze UX and tests",
  run_in_background: true,
  prompt: `TASK: Critical Analysis — Dimensions 6 and 7

SCOPE (if provided): $ARGUMENTS

## DIMENSION 6 — USER EXPERIENCE & MICRO-INTERACTIONS

### 6.1 Tooltips & Labels
- Form fields with tooltips/placeholders?
- Action buttons with tooltips (especially icon-only buttons)?
- Charts/graphs with clear legends?
- Standalone icons with alt text or tooltips?

### 6.2 Validation & Feedback
- Forms with inline validation (not just on submit)?
- Contextual error messages (not generic)?
- Required fields marked visually?

### 6.3 Empty & Loading States
- Empty lists with user guidance ("No items found. Click to add.")?
- Loading states (skeletons, spinners) during data fetches?
- Progress indicators for long operations?
- Error states with retry option?

### 6.4 Navigation & Orientation
- Active page indicator in sidebar/nav?
- Visual feedback after actions (toasts, alerts)?
- Modals with close button and ESC handler?

### 6.5 Accessibility (a11y)
- Images without alt text?
- Forms without <label> associated via htmlFor?
- Interactive components without aria-* attributes?
- Semantic tokens vs hardcoded colors for contrast?
- Keyboard navigation support (tabIndex, onKeyDown)?
- Heading hierarchy (no skipped levels)?

### 6.6 Responsiveness
- Responsive classes (sm:, md:, lg:, xl:)?
- Components that break on mobile (<640px)?
- Large tables with horizontal scroll or alternative layout?
- Modals usable on small screens?

### 6.7 Visual Consistency
- Semantic color tokens (bg-primary, text-foreground) — not hardcoded hex?
- Consistent spacing (Tailwind scale, not arbitrary values)?
- Dark mode: all components work in both themes?

## DIMENSION 7 — TESTS, CI/CD & QUALITY DELIVERY

### 7.1 Test Coverage
- Map all .test.ts and .spec.ts files
- Modules/routers WITHOUT tests
- Critical routers without tests (auth, payments, sensitive data)

### 7.2 Test Quality
- Meaningful assertions (not just "doesn't crash")?
- .skip or .only left behind?
- Integration tests (not just unit)?
- Edge cases (null, empty, overflow)?

### 7.3 Missing Test Types
- Unit tests for critical services/routers
- Integration tests (procedure → response)
- E2E tests for critical flows
- Accessibility tests (axe-core)

### 7.4 CI/CD Pipeline
- Check .github/workflows/ for existing pipelines
- Pipeline runs: type-check, lint, test before merge?
- Auto-deploy (staging, production)?
- Missing steps: coverage, security audit, preview deploy for PRs?

RETURN: standard findings format + category (UX/a11y/tests/CI)`,
});
```

---

## 4. While Agents Run

Run quality gates (Section 1) and collect metrics while waiting.

---

## 5. Consolidate Report

When ALL agents complete, produce `docs/AUDIT-REPORT-{date}.md`:

```markdown
# Critical Audit Report

**Date:** {date} | **Scope:** {scope or "full"}
**Agents:** evaluator (Mode 3), debugger, debugger, frontend-specialist

## Executive Summary

| Dimension | P0 | P1 | P2 | P3 | Total |
|-----------|----|----|----|----|-------|
| 1. Architecture | | | | | |
| 2. Structure | | | | | |
| 3. Code Quality | | | | | |
| 4. Documentation | | | | | |
| 5. Missing Screens | | | | | |
| 6. UX | | | | | |
| 7. Tests/CI | | | | | |
| 8. Dependencies | | | | | |
| 9. Technical Debt | | | | | |
| **TOTAL** | | | | | |

**Quality Thresholds (flag as P1 if violated):**
- Test coverage < 80% on critical routers (auth, payments, sensitive data)
- Cyclomatic complexity > 10 in any function
- Any dependency with a known critical CVE (CVSS ≥ 7.0)

## Dimension N — [Title]

### Findings

| # | Severity | Description | File:Line | Rule Violated |

### Recommendations

[Before/after examples]

## Prioritized Action Plan

| Phase | Severity | # Actions | Timeline |
|-------|----------|-----------|----------|
| 1 | P0 — Critical | X | Immediately |
| 2 | P1 — Important | X | Next sprint |
| 3 | P2 — Moderate | X | Plan and schedule |
| 4 | P3 — Minor | X | Backlog |
```

---

## 6. Codex Adversarial Review (Post-Report — P0/P1 findings)

When the report surfaces P0 or P1 findings, run an independent Codex pass to cross-validate:

```typescript
Skill("codex:rescue"); // loads codex-cli-runtime + gpt-5-4-prompting

// Prompt to pass:
// "Run codex adversarial-review --scope working-tree
//  Focus on: [list P0/P1 findings from report by file:line]
//  Report findings only — do not apply any fixes."
```

**PR mode (`/audit pr`):** Run before spawning the 4 parallel agents:
```bash
# Codex reviews the branch diff first (independent baseline)
# scope=branch covers all commits since branching from main
```

Present Codex findings per `codex:codex-result-handling` protocol:
show all issues → STOP → explicitly ask user which to fix before touching any file.

---

## Usage Examples

```
/audit                     # Full audit (all dimensions)
/audit scope=CRM           # Audit scoped to CRM domain
/audit scope=payments      # Audit scoped to payments flow
/audit pr                  # PR diff: Codex adversarial-review → D3/D8/D9/D3.5
```

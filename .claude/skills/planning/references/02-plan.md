# Plan — Implementation Plan Structure

**Save to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

---

## Plan Document Template

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** Use this plan with `/implement` command.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Complexity:** L[1-10] — [Justification]

---

## Research Summary

| #   | Finding | Confidence | Source   | Impact |
| --- | ------- | ---------- | -------- | ------ |
| 1   | ...     | 4          | codebase | high   |

**Knowledge Gaps:** [What remains unknown]
**Assumptions:** [To validate]
**Edge Cases:** [Min 5 for L4+]

---

## Sprint Contracts

> Negotiated between planner and evaluator BEFORE implementation begins.
> See `references/04-harness-patterns.md` for full template and calibration anchors.

### Sprint Contract: Sprint 1 — [Name]

**Deliverables:**
- [ ] `exact/path/to/file.ts` — [what it does]

**Acceptance Criteria:**
- [ ] `bun run type-check` passes
- [ ] `bun test [path]` passes
- [ ] Edge case: [describe at least 1]

**Done Definition:** `bun run type-check && bun test [path]`

**Boundary (NOT in Sprint 1):** [what is explicitly excluded]

### Sprint Contract: Sprint 2 — [Name]

[Same structure]

---

## Tasks

### Phase 1: Foundation [SEQUENTIAL]

> Context Reset Checkpoint: After this phase completes, write handoff artifact if context > 80K.

### Task 1: [Component Name]

**Files:**

- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:123-145`
- Test: `tests/path/to/test.ts`

**Step 1: Write the failing test**

\`\`\`typescript
test('specific behavior', () => {
const result = processInput(input);
expect(result).toBe(expected);
});
\`\`\`

**Step 2: Run test to verify it fails**

Run: `bun test tests/path/test.ts`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

\`\`\`typescript
export function processInput(input: InputType): OutputType {
return expected;
}
\`\`\`

**Step 4: Run test to verify it passes**

Run: `bun test tests/path/test.ts`
Expected: PASS

**Step 5: Commit**

\`\`\`bash
git add tests/path/test.ts src/path/file.ts
git commit -m "feat: add specific feature"
\`\`\`

### Phase 2: Core [PARALLEL]

> ⚡ PARALLEL-SAFE: Can run simultaneously
> Context Reset Checkpoint: After this phase completes, write handoff artifact if context > 80K.

### Task 2: [Backend Component]

**Owner:** debugger
[Same structure as Task 1]

### Task 3: [Frontend Component]

**Owner:** frontend-specialist
[Same structure as Task 1]

### Phase 3: Integration [SEQUENTIAL]

### Task 4: [Integration]

[Same structure as Task 1]

---

## Handoff

**Options:**

1. Implement now — `/implement`
2. Review first — Open plan file
3. Modify plan — Adjust before execution

**Artifact handoff format** (for context resets between phases):
- Save current state to `docs/plans/HANDOFF-{slug}.md`
- Include: current phase, completed deliverables, active sprint contract, unresolved decisions, next action
- See `references/04-harness-patterns.md` for full handoff artifact template
```

---

## Complexity Levels

| Level  | Indicadores               | Deliverables                |
| ------ | ------------------------- | --------------------------- |
| L1-L2  | Bug fix, single function  | Atomic tasks                |
| L3-L5  | Feature, multi-file       | Tasks + research + parallel + mini-contracts |
| L6-L8  | Architecture, integration | + full sprint contracts + pre-mortem + ADR |
| L9-L10 | Migrations, multi-service | + dependency graph          |

### Complexity Indicators

| Aumenta (+1 a +2) | Diminuye (-1)       |
| ----------------- | ------------------- |
| Multi files       | Patterns existentes |
| DB changes        | Similar code        |
| Auth              | Isolated            |
| 3rd party APIs    | Tests exist         |
| Breaking changes  |                     |
| Security          |                     |
| Multi-service     |                     |

---

## Task Granularity

**Each step is ONE action (2-5 minutes):**

- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement minimal code to pass" — step
- "Run tests and verify pass" — step
- "Commit" — step

```
❌ "Implement auth" (too big)
✅ "Add Zod schema for login form" (atomic)
```

### Task Requirements

- Exact file paths with line ranges
- Complete code (never "add validation" or "implement logic")
- Validation command with expected output
- Rollback implicit: undo the change
- Dependencies marked with ⚡ PARALLEL-SAFE

---

## Phase Organization

### Sequential Phases

```markdown
### Phase 1: Foundation [SEQUENTIAL]

> Must complete before next phase
> Context Reset Checkpoint: write handoff artifact after phase if context > 80K

- Task 1.1
- Task 1.2
```

### Parallel Phases

```markdown
### Phase 2: Core [PARALLEL]

> ⚡ PARALLEL-SAFE: Can run simultaneously

- Task 2.1 (debugger)
- Task 2.2 (frontend-specialist)
- Task 2.3 (debugger)
```

---

## Confidence Scoring

| Score | Significado               | Ação                |
| ----- | ------------------------- | ------------------- |
| **5** | Verified in codebase/docs | Use directly        |
| **4** | Multiple sources agree    | Use with confidence |
| **3** | Community consensus       | Note uncertainty    |
| **2** | Single source/unverified  | Flag as assumption  |
| **1** | Speculation               | Don't rely on it    |

**Rule:** Findings ≤ 2 MUST be flagged and validated before relying.

---

## Agent Selection

| Complexity | Pattern    | Agents           | Parallel? |
| ---------- | ---------- | ---------------- | --------- |
| L1-L2      | Direct     | None             | N/A       |
| L3         | Subagent   | 1 explorer | No        |
| L4-L5      | Swarm      | 2-3 subagents    | YES       |
| L6-L8      | Team       | 3-5 teammates    | YES       |
| L9-L10     | Full Swarm | 5+               | YES       |

---

## L6+ Additions

For complex tasks (L6+), add these sections:

### Risk Assessment

```markdown
## Risk Assessment

| Risk     | Probability  | Impact       | Mitigation        |
| -------- | ------------ | ------------ | ----------------- |
| [Risk 1] | High/Med/Low | High/Med/Low | [How to mitigate] |
```

### Architecture Decision Record (ADR)

```markdown
## ADR: [Decision Title]

**Context:** [Why this decision was needed]

**Decision:** [What was decided]

**Alternatives Considered:**

1. [Alternative 1] — Rejected because [...]
2. [Alternative 2] — Rejected because [...]

**Consequences:** [Trade-offs accepted]
```

> See `references/03-risk.md` for full pre-mortem protocol.

---

## Pre-Commit Checklist

Before presenting plan:

- [ ] Research complete (codebase, docs, edge cases)
- [ ] Sprint contracts negotiated and evaluator-approved
- [ ] Atomic tasks (2-5 min each step)
- [ ] Exact paths with line ranges
- [ ] Complete code provided
- [ ] Parallel tasks marked with ⚡
- [ ] Confidence scores (1-5)
- [ ] L6+: ADR + Risk Assessment

---

## Remember

- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits
- One action per step (2-5 minutes)
- Sprint contracts come BEFORE tasks — evaluator must approve them first

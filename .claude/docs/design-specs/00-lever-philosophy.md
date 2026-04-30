# LEVER Philosophy — Design Foundations

> **L**everage patterns | **E**xtend first | **V**erify reactivity | **E**liminate duplication | **R**educe complexity

**"The best code is no code. The second best structure is the one that already exists."**

This document defines the decision framework for creating or evolving design specifications in NeonDash. It exists to prevent redundant docs, generic UI proposals, and context-heavy guidance that should instead be loaded only when necessary.

---

## Purpose

Use LEVER before creating:

- new design specs
- new architecture docs
- new command guidance
- new rule files
- new component patterns
- new workflow documentation

The goal is to keep the documentation system:

- **modular**
- **discoverable**
- **low-context**
- **high-signal**
- **easy to extend**

---

## Core Principles

### 1. Leverage patterns

Before writing anything new, search for an existing pattern that already solves 70%+ of the problem.

Prefer:

- extending an existing spec
- adding a focused appendix
- creating a small reference doc under an existing domain
- linking related docs instead of duplicating content

Avoid:

- parallel docs with overlapping scope
- “v2”, “final”, “new”, or “enhanced” file naming
- copying the same guidance into commands, rules, and references

### 2. Extend first

Default decision: **extend existing structure**.

Examples:

- Add backend reference material under `architecture/`
- Add UI foundation material under `design-specs/`
- Add loading guidance to command docs instead of inventing a new workflow
- Add “when to load” pointers to rules instead of embedding large reference sections

Create a new file only when:

- the topic is distinct
- the file has a clear, durable role
- merging it into an existing file would reduce clarity
- it improves selective loading

### 3. Verify reactivity

Every documentation change should improve how context is loaded and applied.

Ask:

- Will this help an agent load only what is needed?
- Does this reduce repeated reading of the same material?
- Does this support domain-based retrieval?
- Will future updates have one obvious home?

If not, the structure is probably wrong.

### 4. Eliminate duplication

A rule should point to a reference.
A command should orchestrate loading.
A reference doc should contain the deep detail.

Do not duplicate the same guidance across:

- `AGENTS.md`
- `.claude/rules/*.md`
- `.claude/commands/*.md`
- `.claude/docs/**/*.md`

Use this hierarchy instead:

1. **Rules** = compact guardrails
2. **Commands** = loading strategy and execution flow
3. **Docs** = detailed reference material
4. **Subdirectory AGENTS.md** = canonical domain authority when editing there

### 5. Reduce complexity

Prefer the smallest structure that preserves clarity.

Good:

- one focused foundation doc
- one index README
- one short rule with links to deeper references
- one command that branches by task intent

Bad:

- giant catch-all docs
- commands that always load everything
- rules bloated with examples better suited to reference docs
- multiple files that differ only by wording

---

## Decision Tree

```/dev/null/lever-decision-tree.txt#L1-7
Before adding documentation:
├── Can an existing file handle it? → Yes: EXTEND
├── Can an existing pattern be adapted? → Yes: ADAPT
├── Is the information deep reference material? → Yes: MOVE TO .claude/docs
├── Is it a compact rule or loader? → Yes: KEEP SHORT
└── Otherwise: CREATE only if scope is truly distinct
```

---

## Extend vs Create Scoring

Use this quick score before creating a new doc.

| Factor | Points |
|--------|--------|
| Reuses existing domain structure | +3 |
| Reuses existing terminology/navigation | +2 |
| Reduces context load in commands/rules | +4 |
| Removes duplicated guidance | +4 |
| Makes selective loading easier | +3 |
| Creates overlap with another file | -4 |
| Requires users/agents to read two files for one concept | -5 |
| Introduces a new category with weak boundaries | -3 |

### Interpretation

- **Score > 5** → Extend existing structure
- **Score 1–5** → Likely extend; create only with strong justification
- **Score ≤ 0** → Do not create a new file

---

## Three-Pass Documentation Method

### Pass 1 — Discovery

Identify:

- existing docs in the same domain
- current command/rule references
- duplication points
- best target location for the material

Output:

- no large edits yet
- just structure decisions

### Pass 2 — Design

Define:

- canonical home for the information
- shortest useful filename
- what becomes a rule vs command vs reference
- cross-links needed for on-demand loading

Output:

- outline
- placement plan
- loading strategy

### Pass 3 — Implementation

Execute with maximum reuse:

- move docs instead of copying
- consolidate overlapping notes
- shorten loader instructions
- add “load when needed” guidance
- remove orphaned references

Output:

- minimal, durable file set
- clear entry points
- lower context cost

---

## Documentation Placement Rules

### Put content in `architecture/` when it is about:

- system structure
- backend topology
- integrations
- deployment
- environment model
- data architecture
- reliability/security/observability
- backend learnings and operational references

### Put content in `design-specs/` when it is about:

- UI patterns
- layout systems
- component behavior
- visual language
- interaction design
- design foundations
- frontend learnings
- implementation-ready UI decisions

### Keep content at `.claude/rules/` only when it is:

- compact
- domain-scoped
- action-oriented
- useful as an auto-loaded guardrail

### Keep content at `.claude/commands/` only when it is:

- an execution workflow
- a loading strategy
- a routing instruction
- a concise orchestration layer

---

## Anti-Patterns

### 1. Command as encyclopedia

A command should not embed everything an agent might ever need.

Instead:

- classify intent
- load the right rule
- point to the right reference
- stop

### 2. Rule as tutorial

A rule should not contain pages of examples unless those examples are essential for immediate safe action.

Instead:

- keep the rule compact
- link to the detailed reference doc

### 3. Duplicate foundation docs

If a principle applies to multiple specs, create one foundation doc and reference it.

### 4. Root-level reference clutter

Avoid keeping unrelated deep reference docs mixed at the root of `.claude/docs`.

Prefer grouping by domain:

- `.claude/docs/architecture/`
- `.claude/docs/design-specs/`

### 5. Generic naming

Avoid names like:

- `notes.md`
- `misc.md`
- `guide.md`
- `improvements.md`
- `new-design.md`

Prefer names that communicate exact role and order, such as:

- `00-lever-philosophy.md`
- `00-design-system-foundations.md`
- `11-backend-learnings.md`

---

## Context Engineering Guidance

When organizing docs for intelligent loading:

### Prefer indexed foundations

Use low-numbered foundational docs for shared mental models:

- `00-*` = philosophy / foundations
- `01+` = domain-specific specs
- `README.md` = map of the folder

### Prefer shallow retrieval paths

A good structure lets an agent infer what to load from the task:

- UI task → `design-specs/`
- backend structure task → `architecture/`
- styling/design language task → `design-specs/00-*`
- environment/data task → `architecture/`

### Prefer references over repetition

Write once in the best location, then point to it elsewhere.

### Prefer progressive disclosure

Load:

1. rule
2. command
3. focused reference
4. canonical AGENTS file only if editing that domain

Not the reverse.

---

## Checklist Before Creating a New Doc

- [ ] Did I check whether an existing file can absorb this content?
- [ ] Is this file the clearest canonical home?
- [ ] Will this reduce, not increase, total context load?
- [ ] Can commands reference this instead of duplicating it?
- [ ] Can rules stay shorter because this file exists?
- [ ] Is the filename durable and specific?
- [ ] Does this improve selective loading?

If any answer is “no”, extend first.

---

## Practical Examples

### Good

- Move visual-system guidance into `design-specs/00-*`
- Move backend reference material into `architecture/`
- Keep `prime-frontend` short and point it to exact files by need
- Keep `frontend.md` as a concise guardrail file, not a full handbook

### Bad

- Put all frontend guidance into `/prime-frontend`
- Repeat the same design rules in commands, rules, and specs
- Leave deep reference docs ungrouped at `.claude/docs` root
- Create separate docs for every tiny variation of a component pattern

---

## Summary

LEVER is the default filter for documentation and context design in NeonDash:

- **Leverage** what exists
- **Extend** before creating
- **Verify** that loading becomes smarter
- **Eliminate** duplication
- **Reduce** complexity relentlessly

If a new file does not make the system easier to load, easier to navigate, and easier to maintain, it should not exist.

# ADR-017: Biome + OXLint for Native-Speed Linting (Over ESLint + Prettier)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash is a TypeScript monorepo requiring consistent formatting and linting across all packages. The standard choice is ESLint + Prettier, but both are JavaScript-based and slow on large codebases. Biome (Rust-based, replaces both) and OXLint (Rust-based, supplementary lint rules) offer dramatically faster performance.

The project runs in CI on every PR and requires fast feedback loops. Pre-commit hooks that take >5s are skipped by developers.

## Decision

Use Biome (`biome.base.json` in `packages/config/`, extended per-package) as the formatter AND linter. Use OXLint (`.oxlintrc.json`) for supplementary lint rules that Biome doesn't cover. No ESLint, no Prettier.

Pre-commit workflow: `bunx biome check --write` on edited files → `bun run lint:oxlint` → `bun run type-check`.

**IMPORTANT:** Biome format errors are `error` severity (not `warning`) and fail CI immediately. Must run `bunx biome check --write` before every commit.

## Consequences

**Positive:**
- Biome formats in ~1s (vs ~10s+ for Prettier on large monorepo)
- OXLint runs in ~0.1s (Rust-native)
- Single `biome.base.json` in `packages/config/` provides shared rules to all packages
- Eliminates ESLint plugin version conflicts

**Negative / Trade-offs:**
- Biome has fewer lint rules than ESLint's ecosystem — OXLint fills some gaps
- Some team members accustomed to ESLint will need to adjust
- Biome CRLF behavior: Windows development + Linux CI can cause mass format failures if `.gitattributes` LF enforcement is absent

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — ESLint + Prettier | Largest ecosystem, most plugins | JS-based (slow), plugin conflicts, separate tools | Rejected: slow feedback loop |
| B — Biome only | Single fast tool, format + lint | Fewer rules than ESLint ecosystem | Considered — but OXLint added for gap coverage |
| C — Biome + OXLint | Fast format+lint + supplementary rules | Two tools to configure | **Chosen** |
| D — deno lint / oxc | Fast alternatives | Immature or Deno-specific | Rejected: ecosystem fit |

## Related ADRs

- [ADR-001](001-bun-runtime.md) — Native toolchain philosophy: Rust/Go tools over JS tools where possible
- [ADR-009](009-turborepo-monorepo.md) — Shared `biome.base.json` in `packages/config/` serves the monorepo

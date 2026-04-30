# ADR-004: Use tsgo (@typescript/native-preview) Instead of tsc for Type Checking

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

Full monorepo type checking with `tsc --noEmit` was taking 5+ minutes in CI, making feedback loops too slow for productive development. The `@typescript/native-preview` package (tsgo) is the official Go-native rewrite of TypeScript by the TypeScript team, offering dramatically faster performance.

## Decision

Replace `tsc --noEmit` with `tsgo --noEmit` for all type checking. The command is `bun run type-check`. The use of `bunx tsc` is forbidden in this project.

## Consequences

**Positive:**
- Full monorepo type check completes in ~4 seconds vs ~5 minutes (75x speedup)
- Official TypeScript team project -- not a third-party fork
- Identical type semantics to tsc (same language specification, same rules)
- Dramatically improves CI feedback loop and developer experience

**Negative / Trade-offs:**
- Preview/unstable status -- may have edge-case differences from tsc
- Less IDE integration than official tsc (IDEs still use tsc for hover types and completions)
- Project may need to update tsgo frequently as it evolves toward stable release

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — tsc --noEmit | Official, 100% compatibility, IDE integration | 5+ minutes for full monorepo — unacceptable CI feedback loop | Rejected: too slow |
| B — tsgo (@typescript/native-preview) | ~4s full monorepo, official TypeScript team project, same semantics | Preview/unstable status, less IDE integration | **Chosen** |
| C — SWC type-check | Fast, good ecosystem | Third-party fork, not the TypeScript team's implementation | Rejected: not official |
| D — Skip type-check in CI | Fastest | Defeats the purpose of TypeScript | Rejected: safety violation |

## Related ADRs

- [ADR-001](001-bun-runtime.md) — tsgo runs via `bun run type-check` in the Bun toolchain

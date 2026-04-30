---
description: Deep research mode - parallel exploration of codebase and external docs. Returns structured findings only, no code changes.
workflow_type: parallelization
---

# /research - Parallel Research Only

**ARGUMENTS**:$ARGUMENTS

<command-instruction>
Trigger Phase 2A of the D.R.P.I.V methodology in RESEARCH-ONLY mode.

## Agent Routing (MANDATORY — choose based on WHERE the answer lives)

> [!CRITICAL]
> **`explorer` = CUSTOM agent at `.claude/agents/explorer-agent.md`** — structured Findings Table with confidence scores (1-5), Knowledge Gaps, Librarian Requests.
> **NOT the built-in `Explore` agent.** Use `subagent_type: "explorer"` (exact case, no substitution).

| Question Type                        | Agent       | Why                        |
| ------------------------------------ | ----------- | -------------------------- |
| What exists in our codebase?         | `explorer`  | Answer lives in filesystem |
| How does this code pattern work?     | `explorer`  | Answer lives in filesystem |
| Which files need to change?          | `explorer`  | Answer lives in filesystem |
| How does this library/API work?      | `librarian` | Answer lives externally    |
| What are the best practices for X?   | `librarian` | Answer lives externally    |
| Is this package behavior documented? | `librarian` | Answer lives externally    |

## Execution

1. Fire `explorer` (custom agent, NOT built-in `Explore`) in background for codebase structure analysis
2. Fire `librarian` in background for external documentation **IF** any library, package, or external API is mentioned
3. Continue reading immediately — do not wait
4. Collect background results
5. Output structured findings table with Confidence (1-5), Source, Impact
6. Do NOT implement. Research only.

## Tool Selection

| Question | Tool | Rationale |
|----------|------|-----------|
| API syntax, config options, framework patterns | **Context7** | Official docs — version-accurate, authoritative |
| Current best practices, community patterns | **Tavily** | Training data stales; community evolves fast |
| Package CVEs, security advisories, maintenance status | **Tavily** | Realtime ecosystem state (GHSA, Snyk, npm) |
| Breaking changes in library vN | **Context7 → Tavily** | Official migration guide → community pitfalls |
| Comparing 2+ packages | **Tavily** | Community benchmarks, npm stats, recent reviews |
| Exact hook/function signatures, DB types, Zod schemas | **Context7** | Always prefer over training knowledge |

### Tavily — Web Intelligence

Use for community patterns, CVEs, ecosystem comparisons, migration war stories.

- Formulate 2-3 query variations (`"hono middleware order 2025"`, `"trpc v11 breaking changes"`)
- Scope to authoritative sources: `github.com`, `npmjs.com`, `github.com/advisories`, `snyk.io`
- For CVEs: `site:github.com/advisories <package>` or `<package> CVE GHSA`
- Add year or version to queries to avoid stale results

### Context7 — Documentation Lookup

Use for exact API signatures, config options, and anything needing authoritative current docs.

1. `resolve-library-id` — get library ID from package name
2. `query-docs` — query with specific topic (`"useQuery options"`, `"drizzle insert returning"`)

Always prefer Context7 over training knowledge for: React 19+, TanStack v5+, Hono, Drizzle, tRPC 11, Zod 3, Clerk.

## Approach

1. Classify: answer in codebase (explorer) or external (librarian)?
2. External: API/docs question (Context7) or ecosystem state (Tavily)?
3. Run both tools when question spans documentation + community context
4. Verify key facts across sources — flag contradictions in findings table
5. Confidence score reflects source quality: 1=speculation, 3=community, 5=official docs

## Output

- Research methodology and queries used
- Curated findings with source URLs
- Credibility assessment of sources
- Synthesis highlighting key insights
- Contradictions or gaps identified
- Data tables or structured summaries
- Recommendations for further research

Focus on actionable insights. Always provide direct quotes for important claims.

## Findings Format

| #   | Finding | Confidence | Source              | Impact |
| --- | ------- | ---------- | ------------------- | ------ |
| 1   | ...     | 4          | codebase: path/file | high   |
| 2   | ...     | 5          | docs: URL           | high   |

## Knowledge Gaps

[List what remains unknown after both agents complete]

## Recommended Next Step

[One suggested action based on findings]
</command-instruction>

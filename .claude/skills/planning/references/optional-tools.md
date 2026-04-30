# Optional Research Tools — NotebookLM & Crawl4AI

> These tools are OPTIONAL. Never block the main workflow if they are unavailable.
> Fallback: Tavily search covers all use cases these tools serve.

---

## Prerequisites

**Check availability before using either tool:**

```bash
# NotebookLM CLI
which nlm && nlm doctor
# If either fails → skip ALL NLM steps

# Crawl4AI
python -c "import crawl4ai; print('ok')"
# If fails → skip ALL Crawl4AI steps; use Tavily instead
```

**Rule:** If prerequisite check fails → degrade gracefully, continue with Tavily/codebase research.

---

## NotebookLM

**Use when:** Multi-source research aggregation needed, or synthesizing knowledge across long documents.

### Bootstrap (once per planning session)

```bash
# Check for existing relevant notebook
nlm list | grep -i "<your-project>\|planning"

# Create if needed (uses project name from .claude/config.json)
NB=$(nlm create "${project.name}-$(date +%Y-%m-%d)" --json | jq -r '.id')
nlm alias set planning-session "$NB"

# Add project context (replace with your repo URL)
nlm add url "https://github.com/<your-org>/<your-repo>" --wait
# If your project has architecture/README docs, add them too
[ -f .claude/docs/architecture/README.md ] && nlm add file .claude/docs/architecture/README.md --wait
```

### Research Aggregation (Phase 1)

```bash
# Start deep research
nlm research start --mode deep
nlm research status  # poll until complete

# Import findings
nlm research import

# Query synthesized knowledge
nlm query "What are the main data flows in this system?"
nlm query "What risks exist for [feature] in this codebase?"
```

### Plan Validation (Phase 2.3)

```bash
# Add plan as source
nlm add file docs/PLAN-{slug}.md --wait

# Validate
nlm query "Does this plan cover all requirements from the spec?"
nlm query "What risks does this plan NOT address?"
nlm query "Are there contradictions between the plan and existing patterns?"
```

### Constraints

- Rate limit: ~50 queries/day — batch questions, don't waste on trivial lookups
- Always `--wait` when adding sources (sources not queryable until processed)
- Create a NEW notebook per planning session; don't reuse from unrelated topics
- Never block the workflow if NLM fails — continue with Tavily

---

## Crawl4AI

**Use when:** Live web content extraction needed (competitor analysis, API docs not in Context7, structured data from external sites).

### Decision Tree

```
Is the data structured/repetitive across pages?
  YES → Schema-based extraction (no LLM, fast)
  NO  → Is it one-time / irregular?
    YES → LLM extraction
    NO  → Is it simple docs/markdown?
      YES → Basic crawl
      MULTIPLE URLs → Batch crawl
```

### Quick Patterns

**Basic markdown extraction (docs, articles):**
```bash
# scripts/basic_crawler.py <url>
python .agents/plugins/claude-bridge/skills/planning/scripts/basic_crawler.py https://example.com
# Output: output.md + screenshot.png
```

**Batch crawl (multiple URLs):**
```bash
# scripts/batch_crawler.py --urls url1,url2,url3
python .agents/plugins/claude-bridge/skills/planning/scripts/batch_crawler.py --urls "url1,url2"
# Output: batch_results.json + batch_markdown/
```

**Schema-based extraction (structured/repetitive data):**
```bash
# scripts/extraction_pipeline.py --generate-schema <url>  (once, costs LLM)
# scripts/extraction_pipeline.py --use-schema <url>        (no LLM, fast)
python .agents/plugins/claude-bridge/skills/planning/scripts/extraction_pipeline.py --generate-schema https://example.com
python .agents/plugins/claude-bridge/skills/planning/scripts/extraction_pipeline.py --use-schema https://example.com
```

### Integration with Research Cascade

Use Crawl4AI after Tavily when:
- Tavily returns summaries but you need full structured content
- You need data from multiple pages in a consistent format
- You need screenshots as evidence (Playwright-equivalent for external sites)

Never use Crawl4AI as a replacement for Context7 (use Context7 for library docs).

---

## Graceful Degradation

| Tool unavailable | Fallback |
|-----------------|---------|
| NotebookLM | Tavily `searchContext` for multi-doc synthesis |
| Crawl4AI | Tavily `extract` for single-page content |
| Both | Codebase (Grep/Glob) + Tavily + Sequential Thinking |

The research cascade works without either tool. They add depth, not breadth.

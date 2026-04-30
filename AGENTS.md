# Grupo US — Agent Rules & Project Specification

> **Single source of truth for ALL AI agent behavior AND project-level technical context.**

---

## Cardinal Rules (Non-Negotiable)

> [!CAUTION]
> These rules apply to **every** interaction, regardless of domain or workflow.

1. **Never Assume Correctness.** Verify against official docs, API responses, or runtime tests **before** applying changes.
2. **Always Debug After Changes.** Every modification must be followed by a verification step. Never mark a task as done without evidence that it works.
3. **NEVER use emojis as UI icons.** Use Lucide React SVGs exclusively.
4. **NEVER use SPA approach.** This site MUST be statically generated via Astro.

## Behavior

- Implement directly, don't just suggest
- Follow project code conventions strictly
- Reference applied rules when relevant
- Environment: Windows with WSL Ubuntu.
- Always run terminal commands using: wsl -e bash -c "COMMAND"
- Never use cmd /c — this is a WSL environment.
- Prefer non-interactive, self-terminating commands.
- After any shell command, do not wait for further output.
- Always run commands with timeout to avoid stuck

# SYSTEM ROLE & BEHAVIORAL PROTOCOLS

**ROLE:** Senior Frontend Architect & Avant-Garde UI Designer.
**EXPERIENCE:** 15+ years. Master of visual hierarchy, whitespace, and UX engineering.

## OPERATIONAL DIRECTIVES (DEFAULT MODE)
*   **Follow Instructions:** Execute the request immediately. Do not deviate.
*   **Stay Focused:** Concise answers only. No wandering.
*   **Output First:** Prioritize code and visual solutions.
*   **Maximum Depth:** You must engage in exhaustive, deep-level reasoning.
*   **Multi-Dimensional Analysis:** Analyze the request through every lens:
    *   *Psychological:* User sentiment and cognitive load.
    *   *Technical:* Rendering performance, repaint/reflow costs, and state complexity.
    *   *Accessibility:* WCAG AAA strictness.
    *   *Scalability:* Long-term maintenance and modularity.
*   **Prohibition:** **NEVER** use surface-level logic. If the reasoning feels easy, dig deeper until the logic is irrefutable.

## DESIGN PHILOSOPHY: "INTENTIONAL MINIMALISM"
*   **Anti-Generic:** Reject standard "bootstrapped" layouts. If it looks like a template, it is wrong.
*   **Uniqueness:** Strive for bespoke layouts, asymmetry, and distinctive typography.
*   **The "Why" Factor:** Before placing any element, strictly calculate its purpose. If it has no purpose, delete it.
*   **Minimalism:** Reduction is the ultimate sophistication.

## Core Principles

```yaml
CORE_STANDARDS:
  mantra: "Think → Research → Plan → Decompose with atomic tasks → Implement → Validate"
  mission: "Research first, think systematically, implement flawlessly with cognitive intelligence"
  research_driven: "Multi-source validation for all complex implementations"
  vibecoder_integration: "Constitutional excellence with one-shot resolution philosophy"
  KISS_Principle: "Simple systems that work over complex systems that don't. Choose the simplest solution that meets requirements. Prioritize readable code over clever optimizations. Reduce cognitive load and avoid over-engineering"
  YAGNI_Principle: "Build only what requirements specify. Resist "just in case" features. Refactor when requirements emerge. Focus on current user stories and remove unused, redundant and dead code immediately"
  Chain_of_Thought: "Break problems into sequential steps and atomic subtasks. Verbalize reasoning process. Show intermediate decisions. Validate against requirements"
  preserve_context: "Maintain complete context across all agent and thinking transitions"
  incorporate_always: "Incorporate what we already have, avoid creating new files, enhance the existing structure"
  always_audit: "Never assume the error is fixed, always audit and validate"
  COGNITIVE_ARCHITECTURE:
  meta_cognition: "Think about the thinking process, identify biases, apply constitutional analysis"
  multi_perspective_analysis:
    - "user_perspective: Understanding user intent and constraints"
    - "developer_perspective: Technical implementation and architecture considerations"
    - "business_perspective: Cost, timeline, and stakeholder impact analysis"
    - "security_perspective: Risk assessment and compliance requirements"
    - "quality_perspective: Standards enforcement and continuous improvement"
```

---

## Project Snapshot

| Field        | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| **Type**     | Multi-product Institutional Website (Static Site)                  |
| **Stack**    | Astro 6 + Tailwind CSS v4 + React 19 (Islands) + Framer Motion      |
| **Runtime**  | **Bun** (package manager + runtime)                                |
| **Language** | TypeScript (strict mode)                                           |
| **Deploy**   | **Railway** (static site via GitHub integration)                   |
| **Theme**    | GPUS Theme (Navy/Gold) — `gpus-theme` skill                       |
| **Fonts**    | Playfair Display (headings) + Inter (body) via Google Fonts        |
| **Icons**    | Lucide React (SVG only — no emojis)                                |
| **Purpose**  | Institutional site for Grupo US with landing pages per product     |

---

## Architecture Map

```text
gpus/
├── src/
│   ├── components/
│   │   ├── layout/         # Header.astro, Footer.astro
│   │   ├── home/           # Hero, ProductsGrid, StatsSection, AboutPreview, CTASection
│   │   ├── about/          # Mission, Values, TeamGrid
│   │   ├── landing/        # Reusable product landing sections (9 components)
│   │   │   ├── LandingHero.astro
│   │   │   ├── PainPoints.astro
│   │   │   ├── Pillars.astro
│   │   │   ├── Benefits.astro
│   │   │   ├── Differentials.astro
│   │   │   ├── Testimonials.astro    # Pure Astro (NOT React)
│   │   │   ├── FAQ.astro             # Pure Astro — details/summary
│   │   │   ├── LandingCTA.astro
│   │   │   └── MobileCTABar.astro
│   │   └── shared/         # SectionHeading, Card, Button
│   ├── content/            # Content Collections (JSON data)
│   │   ├── products/       # 7 product JSON files (rich schema); opcional `externalSiteUrl`
│   │   └── team/           # 13 team member JSON files
│   ├── content.config.ts   # Zod schemas + glob loaders
│   ├── layouts/
│   │   └── Layout.astro    # Base layout (SEO, JSON-LD, fonts, skip link, reveal)
│   ├── pages/              # 10 rotas .astro; /otb e /na-mesa-certa = redirect estatico (astro.config)
│   │   ├── index.astro
│   │   ├── sobre.astro
│   │   ├── trintae3.astro
│   │   ├── mentoria-black-neon.astro
│   │   ├── comunidade-us.astro
│   │   ├── curso-auriculo.astro
│   │   ├── neon-dash.astro
│   │   ├── contato.astro
│   │   ├── termos.astro
│   │   └── politica-de-privacidade.astro
│   └── styles/
│       └── global.css      # Tailwind v4 @theme + custom utilities
├── public/
│   └── images/             # Static assets (products/, team/)
├── astro.config.mjs
├── tsconfig.json
├── biome.json
├── lefthook.yml
└── package.json
```

---

## Tech Stack Quick Reference

| Layer          | Technology                | Version |
| -------------- | ------------------------- | ------- |
| Framework      | Astro                     | 6.x     |
| Styling        | Tailwind CSS              | v4.x    |
| Interactivity  | React (Islands only)      | 19.x    |
| Animations     | motion (Framer Motion)    | 12.x    |
| Icons          | Lucide React              | latest  |
| Build Tool     | Vite (integrated in Astro)| 6.x     |
| Deploy         | Railway                   | —       |
| Theme System   | GPUS Theme (adapted)      | —       |

---

## Commands

| Task                 | Command              |
| -------------------- | -------------------- |
| Install dependencies | `bun install`        |
| Start development    | `bun run dev`        |
| Build                | `bun run build`      |
| Preview build        | `bun run preview`    |
| Check types          | `bunx astro check`   |
| URLs produtos externos | `bun run check:external-urls` |

---

## Cursor: plugins, MCP e skills

Agentes neste projeto **devem** usar integrações do Cursor de forma explícita e consistente. **Skills** são instruções (quando acionar, boas práticas); **MCP** expõe ferramentas tipadas; **CLI** é fallback ou tarefas só-terminal.

### Regras MCP (obrigatórias)

1. **Antes de `call_mcp_tool`:** ler o schema do tool em  
   `~/.cursor/projects/home-mauricio-gpus/mcps/<serverIdentifier>/tools/<nome>.json`  
   (argumentos obrigatórios, tipos, defaults).
2. **Nome do servidor na chamada:** usar sempre **`serverIdentifier`**, não o `serverName` curto.  
   Ex.: Tavily → `plugin-tavily-tavily` (chamar `tavily` costuma falhar neste ambiente).
3. **Ordem de preferência:** MCP habilitado → skill relevante → CLI/script → evitar “adivinhar” conteúdo da web sem fonte.

### Servidores MCP — IDs para chamadas (`serverIdentifier`)

| ID (`call_mcp_tool`)                    | Uso típico |
| --------------------------------------- | ---------- |
| `plugin-tavily-tavily`                  | Busca na web, extração de URL, crawl, pesquisa com citações (`tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_research`, `tavily_map`, `tavily_skill`). |
| `plugin-compound-engineering-context7`  | Documentação e exemplos atualizados de bibliotecas (consulta oficial). |
| `user-shadcn`                           | Componentes e padrões shadcn/ui alinhados ao projeto. |
| `cursor-ide-browser`                    | Navegação, snapshot e interação na UI (fluxo: abas → **lock** → ações → **unlock**). |
| `user-sequentialthinking`             | Decomposição encadeada de raciocínio para problemas ambíguos ou de alto risco. |
| `plugin-clerk-clerk`                    | Auth Clerk (só se a tarefa pedir explicitamente). |
| `plugin-neon-postgres-neon`             | Postgres Neon (só se a tarefa pedir explicitamente). |
| `plugin-stripe-stripe`                  | Stripe (só se a tarefa pedir explicitamente). |

### Tavily: MCP vs CLI vs skills

| Canal | Quando usar |
| ----- | ----------- |
| **MCP** `plugin-tavily-tavily` | Tarefas no Cursor: fatos atuais, conteúdo de URLs, crawl, research. Primeira opção. |
| **Skills** `tavily-search`, `tavily-extract`, `tavily-crawl`, `tavily-research`, `tavily-cli`, `tavily-best-practices` | Escolha de fluxo (search → extract → map → crawl → research), parâmetros (`--json`), limites. Ler a skill quando a tarefa envolver web **fora** do repositório. |
| **CLI** `tvly` | Fallback sem MCP, automações em shell, ou quando o usuário pedir comando explícito. Garantir `tvly` no `PATH` (`~/.local/bin` e/ou symlink em `~/.bun/bin`). Checagem: `tvly --status`. |

Não usar Tavily para operações puramente locais (git, `bun run build`, arquivos do repo) salvo para pesquisar erro/documentação externa.

### Escopo deste repositório (site estático Astro)

- **Alto uso:** Context7, shadcn (se UI exigir), browser MCP para verificar páginas, Tavily para pesquisa/copy/docs externos.
- **Baixo uso / sob demanda:** Clerk, Neon, Stripe — apenas se o pedido for explícito; **não** introduzir backend ou pagamentos no site institucional sem requisito de produto.

---

## Package Manager (Bun-only)

> [!CAUTION]
> This project uses **`bun`** as package manager and runtime.
> ✅ `bun install`, `bun run`, `bunx`
> ❌ Do NOT use `npm`, `yarn`, or `pnpm`

---

## Design System (GPUS Theme + Liquid Glass Premium)

> **Source:** GPUS Theme (`gpus-theme` skill) adapted for Na Mesa Certa.
> Uses CSS custom properties with HSL values. Dark mode is the **default and only** mode.
> Semantic tokens via `--primary`, `--background`, `--foreground`, etc.

### Color Palette (Dark Mode — Always Active)

| CSS Variable         | HSL Value         | Hex Equivalent | Usage                |
| -------------------- | ----------------- | -------------- | -------------------- |
| `--background`       | `211 49% 10%`    | `#0d1b2a`     | Page background      |
| `--foreground`       | `39 44% 65%`     | `#c9a66b`     | Default text (gold)  |
| `--card`             | `212 48% 13%`    | ~`#112240`     | Card backgrounds     |
| `--card-foreground`  | `39 44% 65%`     | `#c9a66b`     | Card text            |
| `--primary`          | `39 44% 65%`     | `#c9a66b`     | CTAs, gold accents   |
| `--primary-foreground`| `48 10% 80%`    | ~`#d1ccc0`    | Text on primary      |
| `--muted`            | `39 29% 54%`     | ~`#b09a6d`    | Muted elements       |
| `--muted-foreground` | `48 10% 80%`     | ~`#d1ccc0`    | Muted text           |
| `--accent`           | `26 5% 27%`      | ~`#474340`    | Accent highlights    |
| `--border`           | `26 6% 21%`      | ~`#383533`    | Borders              |
| `--ring`             | `39 29% 54%`     | ~`#b09a6d`    | Focus rings          |
| `--destructive`      | `0 84% 60%`      | ~`#ef4444`    | Error states         |

#### Extended Na Mesa Certa Tokens

| Tailwind Class       | Hex       | Usage                         |
| -------------------- | --------- | ----------------------------- |
| `navy` / `navy-DEFAULT` | `#1a1a2e` | Legacy navy background     |
| `navy-light`         | `#2A2A40` | Glass card backgrounds        |
| `navy-lighter`       | `#3D3D5C` | Hover states                  |
| `gold` / `gold-DEFAULT` | `#D4AF37` | Bright gold CTAs, headlines |
| `gold-light`         | `#E8C96A` | Gold hover states             |
| `gold-dark`          | `#B8960C` | Gold active/pressed states    |
| Text primary         | `#FAFAF9` | Main readable text            |
| Text muted           | `#94A3B8` | Subtitles, metadata           |
| WhatsApp (CTA)     | via `--color-whatsapp` / `--color-whatsapp-hover` in `@theme` | Botão secundário estilo WhatsApp (`bg-whatsapp`, `hover:bg-whatsapp-hover`) — **não** usar `bg-[#25D366]` solto |

### Tipografia

| Usage        | Font             | Weights         | Tailwind Class |
| ------------ | ---------------- | --------------- | -------------- |
| Headings     | Playfair Display | 400, 600, 700   | `font-serif`   |
| Body, UI     | Inter            | 300, 400, 500, 600, 700 | `font-sans` |

### Custom Utilities (from GPUS Theme)

| Class             | Effect                                |
| ----------------- | ------------------------------------- |
| `.bg-mesh`        | Radial gradient mesh background       |
| `.glass-card`     | Glassmorphism (blur + semi-transparent) |
| `.bg-noise`       | Subtle noise texture overlay          |

### Visual Effects

- **Gold glow CTAs:** `box-shadow: 0 0 20px hsl(var(--primary) / 0.3)`
- **Glassmorphism cards:** `glass-card` utility OR `bg-navy-light/80 backdrop-blur-md border border-gold/20`
- **Animations:** `transform` and `opacity` only (never `width`, `height`, `top`, `left`)
- **`prefers-reduced-motion`:** disable all Framer Motion animations via `useReducedMotion()`

### Styling Rules

- **ALWAYS** use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`) or custom navy/gold utilities
- **NEVER** hardcode hex values (no `bg-[#0f4c75]`)
- **ALWAYS** use Tailwind CSS v4 `@theme` directive for custom tokens
- GPUS theme tokens are imported via `theme-tokens.css` adapted for this project

---

## Islands Architecture (Hard Gate)

```
Static HTML (100%): All 22 components are .astro files (zero client JS)
React Islands (0%): None currently exist. All interactivity uses:
  - FAQ: native <details>/<summary> with CSS transitions
  - Header mobile: inline <script> for hamburger toggle
  - Animations: CSS data-reveal via IntersectionObserver (inline script in Layout)
```

> [!CAUTION]
> Do NOT add React Islands without explicit justification. Astro's zero-JS default is the performance advantage.

---

## Content Collections

All dynamic content uses Astro Content Collections (`src/content/`) with Zod schemas in `src/content.config.ts`:

- **products/** — 6 JSON files, one per product. Rich schema: name, slug, tagline, description, type, audience, icon (Lucide name), image, order, hero, painPoints[], pillars[], benefits[], differentials[], faqs[], cta, testimonials[].
- **team/** — 13 JSON files. Schema: name, role, bio, photo, order, social.

To add a new product: create JSON in `src/content/products/` + create `.astro` page in `src/pages/` following the landing template pattern (getCollection → find by slug → pass data to landing components). Se a experiencia canônica for um site externo, defina `externalSiteUrl` no JSON e adicione o mesmo destino em `redirects` em `astro.config.mjs` (e exclua a rota no `filter` do sitemap, se aplicável).

> [!CAUTION]
> **NEVER** hardcode content data inside `.astro` or `.tsx` components. Always use `getCollection()`.

---

## Section Order — Product Landing Pages (Conversion Architecture)

Each product landing page follows this flow (all components in `src/components/landing/`):

| # | Section           | Component                | Purpose                     |
|---|-------------------|-------------------------|-----------------------------|
| 1 | Hero              | `LandingHero.astro`     | Capture attention + value prop |
| 2 | Pain / publico    | `PainPoints.astro`      | Create empathy + fit        |
| 3 | Pilares           | `Pillars.astro`         | Present the solution        |
| 4 | Beneficios        | `Benefits.astro`        | Show transformation         |
| 5 | Diferenciais      | `Differentials.astro`   | Why this product is unique  |
| 6 | Depoimentos       | `Testimonials.astro`    | Social proof (pure Astro)   |
| 7 | FAQ               | `FAQ.astro`             | Eliminate final doubts      |
| 8 | CTA Final         | `LandingCTA.astro`      | Convert the visitor         |
| — | Mobile sticky     | `MobileCTABar.astro`    | CTA persistente (mobile)    |

## Section Order — Home Page

| # | Section           | Component                | Purpose                     |
|---|-------------------|-------------------------|-----------------------------|
| 1 | Hero              | `home/Hero.astro`       | Brand + proposito           |
| 2 | Produtos          | `home/ProductsGrid.astro`| Grid de 6 produtos         |
| 3 | Numeros           | `home/StatsSection.astro`| Impacto em numeros         |
| 4 | Sobre preview     | `home/AboutPreview.astro`| Dra. Sacha + CTA sobre     |
| 5 | CTA Final         | `home/CTASection.astro`  | WhatsApp + contato         |

---

## Performance Requirements (Hard Gates)

- **Lighthouse:** ≥ 95 on Performance, Accessibility, Best Practices, SEO
- **LCP < 2.5s:** Preload hero image, use Astro `<Image />` with `loading="eager"` + `fetchpriority="high"`
- **CLS = 0:** ALL images must have explicit `width` and `height` via Astro Image
- **INP < 100ms:** Defer non-critical JS with `client:visible` or `client:idle`; ilhas só visuais no Hero (`AuroraBackground`, `TextGenerateEffect`) usam `client:idle` em vez de `client:load` quando o SSR já exibe texto/layout legível.
- **Initial JS bundle:** < 50KB (Astro zero-JS default for static sections)
- **Font loading:** `display=swap` to prevent FOIT

---

## Accessibility Requirements

- Contrast ratio: minimum **4.5:1** for all text on navy background
- `prefers-reduced-motion`: wrap ALL Framer Motion animations in `useReducedMotion()`
- Focus states: visible gold outline (`outline: 2px solid #D4AF37`) on all interactive elements
- Images: meaningful `alt` text describing the speaker and their role
- Semantic HTML: `h1` in Hero, `h2` for sections, `h3` for items
- Keyboard navigation: fully functional for FAQ and testimonial carousel
- `aria-label` on all buttons without descriptive text
- **Skip link:** classe `.skip-link` em `global.css` (só `transform`); link “Pular para o conteúdo” aponta para `main#conteudo-principal` (`tabindex="-1"`).
- **Rodapé jurídico:** usar rotas reais (`/termos`, `/politica-de-privacidade`), nunca `href="#"` para Termos/Privacidade.
- **JS desligado:** `<noscript>` força `[data-reveal]` visível para não esconder conteúdo estático.
- **FAQ acordeão:** não animar altura do painel com Framer (`height: 0/auto`); preferir **CSS grid** `grid-template-rows: 0fr` ↔ `1fr` com transição em `grid-template-rows` (chevron pode usar só `rotate`).

---

## Code Quality Standards

### TypeScript
- Strict mode enabled
- `unknown` over `any`
- Const assertions for immutable values

### Component Placement
- `components/` — All presentation components
- `content/` — Data only (JSON Content Collections)
- `layouts/` — Base layout wrapper
- `pages/` — Route pages only

### Negative Constraints
- **NEVER** animate `width`, `height`, `top`, `left` in Framer Motion or layout-breaking ways — use `transform`/`opacity` for Motion; for expand/collapse panels, **CSS grid `0fr`/`1fr`** is the approved pattern (not `m.div` height tweens).
- **NEVER** use emojis as icons — Lucide React SVG only
- **NEVER** hardcode speaker/FAQ/testimonial data in components
- **NEVER** use scroll-jacking or forced scroll effects
- **NEVER** leave clickable elements without `cursor-pointer` and hover states
- **NEVER** use generic box shadows — use subtle colored glows
- **NEVER** import heavy libraries in the main bundle (> 50KB initial JS)

---

## Learnings log (evolve)

### [2026-03-26] Mentoria Black NEON: copy de-duplication — echo reduction + dead data cleanup

> Registro: `evals/site/mentoria-black-neon-evolve/runs/2026-03-26-copy-dedup/run.md`.

**Hypothesis:** Reducing phrase repetition and removing dead data makes each landing section read with distinct voice, improving perceived offer depth.
**Result:** "escalar com estratégia" 4x → 2x | "sem abrir mão da sua essência" 2x → 1x | dead benefits[] 10 items → 0 | decision: **keep**
**Pattern:** When `deliverables[]` shadows `benefits[]` via conditional render, keep both with distinct content (outcomes vs activities). Core brand phrases max 2x — primary positioning + user-language mirror. Bio and story.highlight need autonomous closings.
**Validation:** `bun run lint && bunx astro check && bun run build`

### [2026-03-26] EVOLVE_AUTORESEARCH: ciclo real de autoaprimoramento da skill

> Run: `evals/evolve-autoresearch-self-improve/runs/2026-03-26-self-skill-cycle/`.

**Problema:** Mesmo após alinhar a skill ao `karpathy/autoresearch`, faltavam duas regras operacionais que o `program.md` upstream deixa mais nítidas: (1) em autoaprimoramento, **um único artefato pontuado por run**; qualquer sync do arquivo irmão é camada `program.md`; (2) disciplina explícita para **crash** com retry limitado e histórico append-only preservado.

**Solução:** Rodado um ciclo local com `<evolve_request>` sobre a própria `SKILL.md` (3 amostras, 6 critérios binários). Baseline marcou **11/18**; `c_program_sync` subiu para **17/18**; vencedor `c_program_sync_crash` marcou **18/18**. Aplicadas à `.claude/skills/evolve-autoresearch/SKILL.md` as seções **Self-improvement runs (program.md-class)** e **Crash discipline**. `.claude/commands/evolve.md` ganhou a regra operacional equivalente: um alvo pontuado por run e `crash` com no máximo uma correção rápida antes de descartar.

**Validação:** `python3 .claude/skills/evolve-autoresearch/scripts/evolve_autoresearch_harness.py init-run ...`; `evolve_autoresearch_score.py score-candidate` para baseline + 2 candidatos; `evolve_autoresearch_report.py build-response`; `bun run lint`.

### [2026-03-26] EVOLVE_AUTORESEARCH: toolchain local para harness, candidatos, scoring e response

> Scripts Python stdlib criados em `.claude/skills/evolve-autoresearch/scripts/`.

**Problema:** O workflow já documentava `<evolve_request>`, `experiments.tsv` e `evolve-response.xml`, mas na prática só existia o logger/importador TSV. Faltavam scripts para **congelar o harness**, **seedar candidatos**, **validar o orçamento fixo de grading** e **montar o XML final** sem trabalho manual excessivo.

**Solução:** Adicionados `evolve_autoresearch_harness.py` (`init-run`), `evolve_autoresearch_mutate.py` (`seed-candidates`), `evolve_autoresearch_score.py` (`score-candidate`) e `evolve_autoresearch_report.py` (`build-response`), além de `scripts/README.md`. `SKILL.md`, `.claude/commands/evolve.md` e `evals/README.md` passaram a referenciar o fluxo novo: request → harness congelado → candidatos → grade sheets → `experiments.tsv` → `evolve-response.xml`.

**Validação:** `python3 -m py_compile` nos scripts; smoke test ponta a ponta com `<evolve_request>` mínimo em `/tmp`; `bun run lint`.

### [2026-03-26] EVOLVE_AUTORESEARCH: alinhamento explícito ao karpathy/autoresearch

> Documentação; sem `<evolve_request>` nem TSV desta vez.

**Problema:** A meta-skill já citava Karpathy, mas não deixava explícito o modelo de **três superfícies** (`prepare.py` congelado, `train.py` = artefato único do agente, `program.md` = contexto humano) nem o paralelo **orçamento fixo** (lá: janela de treino; aqui: mesmo `samples_per_iteration` e pool por candidato).

**Solução:** `.claude/skills/evolve-autoresearch/SKILL.md` ganhou a seção *Karpathy autoresearch — structural mapping*, regra *Fixed grading budget per candidate* e referência ao branch `master`. `.claude/commands/evolve.md` §1.2 e §1.5: paralelo resumido, link `tree/master`, correção da numeração duplicada (dois itens `3.` em §1.5).

**Validação:** revisão textual; `bun run lint` na raiz do repo (escopo do projeto).

### [2026-03-25] Curso de Aurículo: checkout-first com Kiwify + FAQ de compra

> Registro: `evals/site/curso-auriculo-conversion/runs/2026-03-25-checkout-cta/run.md`.

**Problema:** A landing de `curso-auriculo` ainda levava para HubSpot, com CTA genérico e copy menos alinhada à oferta visível no checkout da Kiwify; title da página também seguia genérico (`name — Grupo US`).

**Solução:** `src/content/products/curso-auriculo.json` passou a vender explicitamente o **Curso de Aurículo com Técnica de Perfuração Auricular**, com `cta.url` para `https://pay.kiwify.com.br/kMXdriO`, label de compra direta, mensagem de WhatsApp para dúvidas pré-inscrição, FAQ orientada a objeção de compra e hero/meta mais próximos da intenção comercial. `src/pages/curso-auriculo.astro` ganhou title dedicado; `LandingCTA` ajusta a microcopy quando o primário é checkout externo, deixando WhatsApp como suporte.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-25] Curso de Aurículo: batch 10x de copy, narrativa e CTA

> Registro: `evals/site/curso-auriculo-conversion/runs/2026-03-25-10x-copy-loop/run.md`.

**Problema:** Mesmo após alinhar o checkout, a página ainda podia ganhar clareza em transformação, qualificação do visitante, linguagem do botão e ordem de objeções. A promessa seguia parcialmente feature-first e faltava contexto operacional perto do CTA.

**Solução:** Batch de 10 loops com base em boas práticas de landing pages de curso: `LandingHero` agora mostra a `tagline`; `cta.helperText` opcional em `src/content.config.ts` permite colocar contexto operacional perto do botão; `curso-auriculo.json` recebeu headline com prazo, CTA “Garantir minha inscrição”, helper text, benefícios mais orientados a resultado e FAQ em ordem de decisão (fit, inclusão da técnica, formato, comparação com `TRINTAE3`, condições comerciais e suporte no WhatsApp). Title da rota também foi refinado.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Curso de Aurículo: EVOLVE_AUTORESEARCH em CTA e copy (âncora temporal + checkout explícito)

> Registro: `evals/site/curso-auriculo-conversion/runs/2026-03-26-evolve-autoresearch-cta/run.md` e `evals/curso-auriculo-landing-copy/runs/2026-03-26-cta-copy-evolve/`.

**Problema:** H1 começava com benefício genérico (“Adicione…”), o que atrasava a leitura do prazo/formato; CTA “Garantir minha inscrição” era válido porém menos explícito em primeira pessoa; meta e helper podiam ser mais diretos sobre checkout vs Laura.

**Solução:** Harness binário (7 critérios × 3 personas) na meta-skill `evolve-autoresearch`; candidato `c_timeframe_action` promovido. `hero.headline` passa a abrir com **“Em 3 dias presenciais,”**; `cta.label` **“Quero me inscrever agora”**; `helperText` e `description` nomeiam checkout/valores atualizados; FAQ de inscrição alinhada ao texto do CTA; title da rota com “inscrição” para SERP. Spec vencedora em `best_skill_prompt.txt` do run.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Landings: um único CTA quando `cta.url` já é WhatsApp

> Registro: `evals/site/cta-whatsapp-dedup/runs/2026-03-26-dedup/run.md`.

**Problema:** `LandingHero` e `LandingCTA` mostravam botão primário (ouro) e botão verde “Falar com a Laura” mesmo quando ambos apontavam para WhatsApp — redundante e confuso (ex.: Mentoria Black NEON).

**Solução:** `isWhatsAppDestination()` em `src/lib/whatsapp.ts` (`wa.me`, `api.whatsapp.com`, `wa.link`); se verdadeiro, o botão verde secundário não renderiza. `LandingCTA` ajusta o subtítulo quando só há um botão. Produtos com `cta.url` externa (HubSpot, site) mantêm os dois CTAs.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] `.planning/` e roadmap sincronizados com o repo

> Registro: `evals/site/planning-docs-sync/runs/2026-03-26-planning-sync/run.md` e `compound.md`.

**Problema:** `PROJECT.md` / `ROADMAP` / `REQUIREMENTS` citavam 11 páginas, View Transitions obrigatório, WhatsApp antigo em roadmap, e planos de fase sem refletir MPA + 8 páginas + 5 redirects + Laura.

**Solução:** Atualizar estado validado (TECH-01/04 feitos; TECH-03 superseded); corrigir contagens de rotas; nota em `01-PLAN-1.3` **SUPERSEDED**; `STACK`/`STRUCTURE`/`CONVENTIONS` com `whatsapp.ts` e redirects; `gpus-company-info.md` com canal institucional vs legado.

**Validação:** revisão textual; sem regressão de build (nenhuma alteração em `src/` neste commit de docs).

### [2026-03-25] WhatsApp institucional: SDR Laura (+55 62 9470-5081)

> Registro: `evals/site/sdr-laura-whatsapp/runs/2026-03-25-sdr-whatsapp/run.md` e `compound.md`.

**Problema:** Vários `wa.me/5511920474028` hardcoded (Hero, LandingCTA, home CTA, contato, footer, JSON-LD); mentoria com `wa.link`; mensagens genéricas sem direcionar ao atendimento SDR.

**Solução:** `src/lib/whatsapp.ts` como fonte única (`WHATSAPP_SDR_E164`, `whatsappUrlWithText`, `WHATSAPP_DEFAULT_SITE_MESSAGE`); landings e layout apontando para Laura; copy de CTA e `aria-label` com “Laura”; todos os `whatsappMessage` nos JSON com prefixo “Olá, Laura!”; mentoria `cta.url` em `wa.me` com texto alinhado; footer e Organization schema com telefone (62) e `wa.me/556294705081`.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-25] Mentoria Black NEON: SEO, copy, CTA, FAQ de funil e LCP (NeonStory)

> Registro: `evals/site/mentoria-black-neon-evolve/runs/2026-03-25-20x-loop/run.md` e `compound.md`.

**Problema:** Title da página só repetia o nome do produto; H1 longo com destaque dourado na última palavra pouco memorável (“você”); meta e CTA menos alinhados a dono de clínica e qualificação no WhatsApp; FAQs sem objeção TRINTAE3 vs mentoria nem formato gravado vs vivo; `NeonStory` com `bg-[#fafaf9]` (hex solto) e imagem `eager`/`fetchpriority=high` competindo com hero texto-first.

**Solução:** Title dedicado com keywords de escala + saúde estética; `description` com 6 meses, ICP e micro-CTA; hero reescrito terminando em **NEON**; story e highlight com “olhar de dono” e nome do produto; duas FAQs de funil; CTA alinhado à Laura (SDR) + mensagem pré-preenchida com vagas/ciclo; `ogImage={d.image}` na página; `NeonStory` com `bg-text-primary`, imagem `lazy`/`fetchpriority=low`, alt descritivo.

**Validação:** `bun run lint && bunx astro check && bun run build`.

**Nota:** O lote anterior citava `NeonStory` com `eager`+`high` para outro contexto de prioridade; nesta rota o hero é texto-first e a imagem da story costuma ser abaixo da dobra — priorizar LCP com `lazy`+`low` aqui.

### [2026-03-26] Lote 10× performance: debug off, idle hydration, preconnect, prioridades de imagem

> Registro: `evals/site/performance-batch-2026-03-26/runs/2026-03-26-10x-perf/run.md`.

**Problema:** `fetch` para `127.0.0.1:7777` em `astro.config`, `productsNav`, `text-generate-effect`, `lamp`; Hero com `client:load` em ilhas só visuais; listeners `astro:after-swap` sem `ClientRouter`; candidatos a LCP sem `fetchpriority`.

**Solução:** Remover instrumentação; `AuroraBackground` e `TextGenerateEffect` com `client:idle`; `preconnect` Google Fonts; remover `astro:after-swap` em Layout e Header; logo com `fetchpriority="high"`; `NeonStory` imagem `eager`+`high`; avatares/about preview com `fetchpriority="low"`.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Lote 10× evolve: home institucional, CTA, meta de produtos e 404

> Registro agregado: `evals/site/evolve-batch-2026-03-26/runs/2026-03-26-10x-loop/run.md` e `compound.md`.

**Escopo:** dez ciclos seguidos (copy/SEO/conversão): grid de produtos (sem `fetch` de debug em localhost), seção CTA, preview “Sobre”, stats com `h2` acessível, meta de contato e sobre, blurb do rodapé, campo `description` em `trintae3`, `curso-auriculo` e `mentoria-black-neon`, copy e meta da 404.

**Padrão:** `description` nos JSON de produto alimenta `<meta name="description">` nas landings que passam `description={d.description}` — tratar como **superfície SEO** junto com hero/tagline.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Home: alinhar SERP, Hero e jornada à trilha comercial

> Run: `evals/site/home-narrative-seo/runs/2026-03-26-evolve-home/run.md`.

**Problema:** Title/description da home e copy do Hero não guiavam com a mesma clareza a **intenção de busca** (formação + negócios em saúde estética) nem o **próximo passo**; a timeline da jornada tinha pt-BR sem acento e um subtítulo com vocabulário de implementação (“manual”, URLs).

**Solução:** Title/meta da `index` e defaults do `Layout` (incl. JSON-LD Organization) com narrativa única; Hero com headline “referências na estética avançada”, subtítulo com pilares e trilha; CTA primário “Ver trilha de programas”; resumos da jornada revisados e subtítulo voltado ao visitante. Comando `/evolve`: **§1.0** passa a tratar pedidos em linguagem natural de evolução do site como `<area>evolve</area>`.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-25] Sincronizar roteiro de vendas e persona com o código

> Após alinhar a landing ao copy oficial e à persona (Google Docs).

**Contexto:** O roteiro prescreve blocos (hero, dor, pilares, vídeo, benefícios, palestrantes, cronograma, ingressos, hostess, FAQ, CTA). A persona reforça tom (mesa certa, luz/brilho, “você”, frases de impacto) e uso de emoji **no social** — não na UI do site.

**Padrões:**

- **Palestrante em destaque:** `src/content/speakers/sacha.json` (`bio`, `title`, `learn_text`) alimenta `SpeakersGrid` e o JSON-LD de `index.astro` para performers revelados. Manter nome de produtos consistente (ex.: **Mentoria BLACK NEON**, não só “NEON”).
- **Preços (evento BR):** Exibir **parcela 12x em destaque** e valor à vista como linha secundária, quando o material de vendas assim definir.
- **Countdown / checklist:** Data do evento no Hero, `CountdownTimer` e checklist deste arquivo devem coincidir (atual: **18–19/09/2026**).
- **Pesquisa de copy em Docs:** Preferir export em texto (`/document/d/…/export?format=txt`) para comparar com o repo sem copiar manualmente parágrafo a parágrafo.

**Validação após mudanças de copy:** `bunx astro check && bun run build`.

### [2026-03-25] Pós-auditoria: FAQ, a11y, jurídico, Lucide, rotas

> Após rodada `/debug` e correções P1–P3.

**Problema:** Acordeão com Framer animando altura do painel; placeholders `#` em links legais; ícone Lucide deprecado; CTA WhatsApp com hex solto; conteúdo `[data-reveal]` invisível sem JS.

**Solução:** Painel FAQ com **CSS grid** `0fr`/`1fr`; rotas `/termos` e `/politica-de-privacidade`; `AtSign` no carrossel de depoimentos; tokens `--color-whatsapp*` no `@theme`; skip link + `noscript` para reveal; navegação entre páginas por **full reload** (sem `ClientRouter`, alinhado à regra anti-SPA).

**Validação:** `bunx astro check && bun run build`.

### [2026-03-25] Produtos com site externo (Na Mesa Certa + OTB Dubai)

**Contexto:** Conteúdo canônico em apps separados; site institucional só encaminha.

**Padrões:**

- **`externalSiteUrl`** no JSON do produto: grid da home, header e footer apontam para o site externo (`target="_blank"`, `rel="noopener noreferrer"`); texto `sr-only` no card quando externo.
- **`redirects` em `astro.config.mjs`:** mesma URL que `externalSiteUrl` para `/na-mesa-certa` e `/otb` — HTML estático com `noindex`, `canonical` para o destino e meta refresh (bookmarks e links antigos).
- **Sitemap:** `filter` em `@astrojs/sitemap` exclui essas duas rotas (evita indexar páginas só de redirect).
- **Sincronizar destinos:** ao trocar URL de produção (ex.: sair do Lovable), atualizar `externalSiteUrl`, `cta.url`, `redirects` e o `filter` se o path mudar.

**Validação:** `bun run check:external-urls && bunx astro check && bun run build` (ver [`docs/solutions/integration-issues/astro-static-external-product-routing.md`](docs/solutions/integration-issues/astro-static-external-product-routing.md)).

### [2026-03-25] Plugins Cursor: MCP, skills e Tavily

**Contexto:** Alinhar agentes ao uso correto de MCP (`serverIdentifier`), skills do ecossistema e CLI onde fizer sentido.

**Padrões:** Ler descriptor JSON antes de `call_mcp_tool`; Tavily via servidor `plugin-tavily-tavily`; skills `tavily-*` para procedimento; `tvly` no terminal como fallback. Demais servidores conforme tabela em **Cursor: plugins, MCP e skills** — sem expandir escopo do site estático para auth/DB/pagamentos sem pedido explícito.

---

## Commit Format

Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

---

## Debugging Protocol

**When an error occurs:**

1. **PAUSE** — Don't immediately retry
2. **THINK** — Root Cause Analysis:
   - What exactly happened?
   - Why? (5 Whys)
   - What are 3 possible fixes?
3. **HYPOTHESIZE** — Formulate hypothesis + validation plan
4. **EXECUTE** — Apply fix after understanding cause
5. **VERIFY** — Confirm fix works, no regressions

---

## Checklist Pre-Entrega

- [ ] Lighthouse Performance >= 95
- [ ] Lighthouse Accessibility >= 95
- [ ] Lighthouse SEO >= 95
- [ ] CLS = 0 (sem layout shift)
- [ ] LCP < 2.5s
- [ ] Responsivo em 375px, 768px, 1024px, 1440px
- [ ] Sem emojis como icones (apenas Lucide SVG)
- [ ] `prefers-reduced-motion` respeitado em todas as animacoes CSS
- [ ] Links de CTA funcionais (WhatsApp, checkout externo)
- [ ] Dados de produtos/equipe em Content Collections (zero hardcoding)
- [ ] Sticky mobile CTA bar em todas as landing pages (oculta no desktop)
- [ ] Todas as rotas (incl. redirects) gerando sem erros (`bun run build`)
- [ ] Lint limpo (`bun run lint`)
- [ ] Type check limpo (`bunx astro check`)

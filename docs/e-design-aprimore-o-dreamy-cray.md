# Design Refresh — Dark Mode + Animated Components

> Plano de execução do `/plan` para o pedido: aprimorar design geral, criar toggle dark/light com transição animada e contraste seguro, ativar componentes shadcn dos registries cadastrados.

---

## Context

**O que motivou:** o app já tem 100% dos tokens light Material-3 em `src/styles/global.css` e tipografia/spacing alinhados ao spec, mas (a) não existe `@variant dark` apesar de a spec `.claude/rules/DESIGN.md` § 16 já ter os hex prontos; (b) não há toggle de tema; (c) há duas violações de hex inline (`bg-[#faf6f0]` em `PublicLayout.astro:59` e `AdminLayout.astro:35`); (d) o catálogo shadcn em `components.json` está cadastrado mas **nenhum** componente foi instalado; (e) a infra de animação é só `prefers-reduced-motion` global + hover em buttons/cards — sem reveal-on-scroll, contadores animados, ou transição de tema.

**Resultado esperado:**
1. `<html class="dark">` controlável via toggle no header (público) e no sidebar (admin).
2. Transição light↔dark suave (View Transitions API + fallback CSS, sem FOUC, sem CLS, respeitando `prefers-reduced-motion`).
3. Todos os pares de contraste validados contra DESIGN.md § 2.8 (light) e § 2.9 (dark) — WCAG AA mínimo, AAA em body.
4. Componentes shadcn instalados via registries (dialog, sonner, tabs, sticky-scroll-reveal) substituindo containers ad-hoc onde fizer sentido.
5. Páginas com micro-animações server-friendly: KPIs com counter on-view, cards com fade-in stagger, hero com spotlight sutil — tudo CSS-first ou com islands `client:visible`.

**Override explícito:** `AGENTS.md` declara "Dark mode is **not** a goal in MVP". O usuário pediu agora — registrar como decisão de scope-bump (rule § 16 "Future Activation" passa a ser "Active Sprint").

---

## Complexity & Layers

**Complexity:** L6+ — toca styles + middleware + 2 layouts + ~6 páginas + components.json + 5+ novos componentes; introduz dependência (toggle de tema) que precisa rodar antes do primeiro paint; adiciona infra de animação.

**Layers (execution order):**
```
Tokens (global.css @theme + @variant)
  → Theme bootstrap (inline <head> script, FOUC guard)
  → Theme toggle island (React)
  → Layouts (Public + Admin: integrar toggle, fixar #faf6f0)
  → components.json fix (iconLibrary, tailwind config path)
  → shadcn primitives install (dialog, sonner, tabs, tw-animate-css)
  → Animation utilities (Reveal.astro, AnimatedNumber.tsx)
  → Page-level polish (landing, /doar, /doar/[slug], /prestacao, /admin)
  → QA gate (Lighthouse + WebAIM + a11y + perf budgets)
```

---

## Assumptions

- `[ASSUMED]` Usuário aceita scope-bump de dark mode para shipping agora (override AGENTS.md "out of MVP").
- `[ASSUMED]` Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))` é compatível com a versão `^4.2.4` instalada (verificar via Context7 antes do início).
- `[ASSUMED]` View Transitions API (Chrome 111+, Edge 111+, Safari TP) é aceitável como progressive enhancement; navegadores sem suporte caem para CSS transition de 240ms — sem fallback de toggle exposto.
- `[ASSUMED]` `bunx shadcn@latest add` funciona com Tailwind v4 sem `tailwind.config.js` (workaround documentado: criar shim vazio se o CLI reclamar).
- `[ASSUMED]` Não vamos adicionar `framer-motion`/`motion` library — animações via CSS + IntersectionObserver para preservar budget < 50 KB de JS em páginas prerendered.
- `[ASSUMED]` `bg-[#faf6f0]` foi tom intencional (warmer que `surface-container-low`); decisão: substituir por `bg-surface-container-lowest` (alinha com DESIGN.md § 4.7 "Top Nav Bg | `#ffffff` lowest | `#0a0d0b` lowest"), eliminando o off-token.

---

## Sprints

### Sprint 1 — Dark Mode Foundation (tokens + bootstrap + toggle)

**Scope:** todos os tokens dark dentro do mesmo `global.css`, inline-script para hidratar tema antes do primeiro paint, toggle island acessível com View Transitions.

#### 1.1 — `src/styles/global.css` (atualizar)

- [ ] Adicionar `@custom-variant dark (&:where(.dark, .dark *));` logo abaixo do `@import "tailwindcss";` (linha 1).
- [ ] Adicionar bloco `:root` com `color-scheme: light; transition: background-color 240ms ease, color 240ms ease, border-color 240ms ease;`. Wrap em `@media (prefers-reduced-motion: no-preference)` para evitar transição em quem prefere reduzido.
- [ ] Após o bloco `@theme {…}` existente (linha 133), adicionar bloco `@layer base { .dark { … } }` com **todos** os 50 tokens de cor mirror per DESIGN.md § 2.2–2.6 (primary, secondary, tertiary, error, surfaces 0–5, outlines, inverse). Tokens `*-fixed*` permanecem invariantes (não duplicar).
- [ ] Adicionar dark variants das 4 sombras (DESIGN.md § 7): `--shadow-card: 0 4px 12px rgba(0,0,0,0.30)`, `--shadow-card-hover: 0 4px 12px rgba(0,0,0,0.40)`, `--shadow-modal: 0 16px 40px rgba(0,0,0,0.40)`, `--shadow-cta: 0 4px 12px rgba(0,0,0,0.40)`.
- [ ] Adicionar `.dark { color-scheme: dark; }` para que form controls nativos (scrollbar, autofill) usem paleta dark.
- [ ] Adicionar `@layer utilities` com `.theme-transitioning *` que ativa `transition-property: background-color, color, border-color, fill, stroke` por 240ms — usado por toggle JS para evitar transição global permanente.
- [ ] Adicionar keyframes + selectors `::view-transition-old(root)` e `::view-transition-new(root)` para clip-path circle expand a partir das `--toggle-x` / `--toggle-y` CSS vars (set pelo toggle no clique).

**Verify:** `bunx astro check` 0 erros · abrir devtools, alternar `<html class="dark">` no inspector, conferir que 100% das superfícies trocam (não há `bg-zinc-*`/`bg-stone-*` cross-mode).

#### 1.2 — `src/components/ui/ThemeToggle.tsx` (criar — React island)

- [ ] Criar componente React 19 com `useState`+`useEffect` para hidratar tema do `localStorage` (chave `salda-theme`, valores `'light' | 'dark' | 'system'`).
- [ ] Estado inicial lido via `document.documentElement.classList.contains('dark')` (já setado pelo inline script — vide 1.3).
- [ ] Ícone Lucide via `lucide-react`: `Sun` (light), `Moon` (dark), `Monitor` (system). Tamanho 20px, cor herda `text-on-surface-variant`.
- [ ] Botão único com 3-state cycle (light → dark → system → light) ou 3-button group; preferência: **single button** com `aria-label` descrevendo próximo estado, `aria-pressed` no estado dark.
- [ ] Ao clicar: capturar `event.clientX/Y` → setar `--toggle-x` / `--toggle-y` em `document.documentElement.style`. Se `document.startViewTransition` existir e `prefers-reduced-motion` é "no-preference", embrulhar swap de classe em `startViewTransition()`. Senão: adicionar `.theme-transitioning` na root, fazer swap, remover `.theme-transitioning` após 250ms.
- [ ] Persistir escolha em `localStorage`. Em modo `system`, registrar `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', …)`.
- [ ] Sincronizar entre abas via `window.addEventListener('storage', …)`.
- [ ] Foco ring 2px secondary + 2px offset (já global). Touch target 40×40 desktop / 44×44 mobile.

**Verify:** mount num storybook-like test page; alternar 3 vezes; conferir transição suave sem CLS; conferir reduced-motion via DevTools rendering panel; conferir aria-label muda corretamente.

#### 1.3 — `src/layouts/PublicLayout.astro` + `src/layouts/AdminLayout.astro` (atualizar)

- [ ] No `<head>` de ambos os layouts, **antes** do `<link rel="stylesheet">` do Google Fonts, adicionar `<script is:inline>` com IIFE: lê `localStorage.getItem('salda-theme')` ?? `'system'`, resolve para `'light' | 'dark'` via `matchMedia`, aplica `document.documentElement.classList.toggle('dark', resolved === 'dark')`. Esse script é blocking (sem `defer`/`async`) — garante que `<html>` já tem a classe correta antes do primeiro paint, eliminando FOUC.
- [ ] Trocar `bg-[#faf6f0]` por `bg-surface-container-lowest` em `PublicLayout.astro:59` (header) e `AdminLayout.astro:35` (sidebar). Validar no DevTools que no light o tom esperado é `#ffffff` (per DESIGN.md § 4.7) — se o cliente quiser o tom mais quente `#faf6f0`, alternativa é adicionar token `--color-header-bg` em ambos os modos (light `#faf6f0`, dark `#0a0d0b`) e usar `bg-header-bg`. **Decisão default:** semantic token `surface-container-lowest`.
- [ ] Importar `ThemeToggle` em ambos layouts e renderizar com `client:idle`:
  - **PublicLayout:** dentro do `<header>`, à esquerda do link `account_circle`. Variante `size="sm"`.
  - **AdminLayout:** dentro do `<aside>`, no bloco `mt-auto` antes do botão "Sair". Variante full-width com label "Tema".
- [ ] Atualizar `<meta name="theme-color">` em PublicLayout para usar dois valores condicionais via `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#012d1d">` e versão dark `content="#0f1411"`. Removendo violação de hex tokenizado (decisão: meta tag aceita literal — manter `#012d1d`/`#0f1411` direto, é não-renderizado).

**Verify:** carregar `/` com `localStorage.salda-theme = 'dark'` → primeira tela já vem dark, sem flash branco. Lighthouse perf não regride (script inline ~700 bytes).

#### Done when (Sprint 1)
- [ ] `bunx astro check` 0 erros, 0 warnings
- [ ] `<html class="dark">` aplicado antes do primeiro paint quando localStorage = dark (verificar via DevTools "Disable JavaScript" + reload — sem JS, deve cair no `prefers-color-scheme` via `@media`; com JS habilitado e localStorage setado, classe aparece imediatamente)
- [ ] Toggle alterna light → dark → system → light com transição visual ≤ 280ms
- [ ] DevTools rendering "Emulate prefers-reduced-motion: reduce" → toggle troca instantâneo sem animação
- [ ] WebAIM contrast checker passa em todos os 16 pares de DESIGN.md § 2.9 (dark)
- [ ] Sem FOUC quando recarrega em modo dark
- [ ] Mobile Safari iOS 16+ funciona (View Transitions cai no fallback CSS — comportamento aceitável)

#### Out of scope (Sprint 1)
- Mockups dark gerados em `docs/stitch-design/` (DESIGN.md § 16 pré-requisito 4 — defer)
- Toggle "high-contrast" mode (não pedido)
- Sincronização de tema com server-side cookie / SSR injection (defer — localStorage + inline script é suficiente para MVP de dark)

---

### Sprint 2 — components.json + shadcn primitives

**Scope:** corrigir `components.json` para Lucide + Tailwind v4, instalar 4 componentes shadcn que entregam valor mensurável (Dialog para Pix modal, Sonner para feedback, Tabs para filtros /doar, Sticky-Scroll-Reveal para landing).

#### 2.1 — `components.json` (atualizar)

- [ ] Trocar `"iconLibrary": "radix"` por `"iconLibrary": "lucide"` — alinha com cardinal rule #3 (Lucide-only) e evita CLI puxar `@radix-ui/react-icons`.
- [ ] Trocar `"tailwind": { "config": "tailwind.config.js", … }` por `"tailwind": { "config": "", "css": "src/styles/global.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" }` — Tailwind v4 dispensa config file, `""` evita CLI gerar shim incorreto.
- [ ] Manter os 6 registries existentes.

**Verify:** `bunx shadcn@latest add button --dry-run` (dry run) — checar que o CLI lê `components.json` sem erro e referencia Lucide.

#### 2.2 — Instalar dependências base

- [ ] `bun add class-variance-authority` (cva — usado pelos componentes shadcn `new-york`).
- [ ] `bun add -d tw-animate-css` (utility classes para `data-state` animations dos primitives radix).
- [ ] Adicionar `@import "tw-animate-css";` em `src/styles/global.css` linha 2 (logo após `@import "tailwindcss";`).

**Verify:** `bun run build` succeed; bundle de página estática (`/`) ≤ 50 KB JS.

#### 2.3 — Instalar shadcn primitives via CLI

Lista priorizada por valor (instalar 1 por 1, conferir após cada):

- [ ] `bunx shadcn@latest add dialog` — `@radix-ui/react-dialog`, ~12 KB gzip. Substitui PixPanel container atual em `src/components/donation/PixPanel.tsx` por `<Dialog>` (acessibilidade focus-trap, escape-to-close, aria nativo).
- [ ] `bunx shadcn@latest add sonner` — toast lib (~6 KB gz). Usar em `DonationForm.tsx` para feedback "Pix copiado", "Doação criada", "Aguardando confirmação".
- [ ] `bunx shadcn@latest add tabs` — `@radix-ui/react-tabs`, ~5 KB gz. Substitui filtros nativos `<select>` em `src/pages/doar/index.astro` por `<Tabs>` com transição animada entre painéis.
- [ ] `bunx shadcn@latest add @aceternity/sticky-scroll-reveal` — text+media reveal para `/prestacao-de-contas` timeline (CLS-safe, pure transform/opacity per librarian).

Após cada `add`, abrir o arquivo gerado em `src/components/ui/` e:
- Garantir que toda cor literal seja substituída por token semântico Material-3 (`bg-primary`, `text-on-surface`) — DESIGN.md § 2.10 rule 9.
- Garantir que `cn()` seja importado de `@/lib/utils` (já existente).
- Garantir tipagem strict (sem `any`).

**Verify:** `bunx astro check` 0 erros após cada install. `bun run build` continua < 50 KB JS por página estática.

#### 2.4 — `src/lib/utils.ts` (validar — sem alteração se já existe)

- [ ] Confirmar que `cn` exporta `(...inputs) => twMerge(clsx(inputs))` usando `clsx` + `tailwind-merge` (ambos já em deps).

#### Done when (Sprint 2)
- [ ] `components.json` atualizado, CLI funciona (`bunx shadcn add tabs --dry-run` sem erro)
- [ ] 4 componentes shadcn em `src/components/ui/` (`dialog.tsx`, `sonner.tsx`, `tabs.tsx`, `sticky-scroll-reveal.tsx`)
- [ ] Todos com tokens Material-3 — `grep -E '#[0-9a-f]{3,6}' src/components/ui/*.tsx` retorna 0
- [ ] `bunx astro check` 0 erros
- [ ] Bundle JS de `/` (prerender) ≤ 50 KB (medir com `bun run build` + `du -sh dist/_astro`)

#### Out of scope (Sprint 2)
- Substituir Card/Button/Badge `.astro` por shadcn React equivalents (mantém zero-JS nessas primitives)
- Instalar componentes "wow" (sparkles, particles, glitch) — banidos pela DESIGN.md § 11 rejection gate "Sales-Loud"

---

### Sprint 3 — Animation utilities (reveal + counter + transitions)

**Scope:** infra de animação CSS-first com 2 islands React mínimos. Sem framer-motion / motion lib.

#### 3.1 — `src/components/ui/Reveal.astro` (criar)

- [ ] Astro component com slot. Props: `delay?: number` (ms, default 0), `as?: 'div' | 'section' | 'article'`.
- [ ] Renderiza `<Tag class="reveal" data-reveal-delay={delay}><slot /></Tag>`.
- [ ] CSS em `global.css @layer utilities`: `.reveal { opacity: 0; transform: translateY(8px); transition: opacity 400ms ease-out, transform 400ms ease-out; }` e `.reveal.is-visible { opacity: 1; transform: none; }`.
- [ ] Em `PublicLayout.astro` body, adicionar `<script is:inline>` com IntersectionObserver (rootMargin -10%, threshold 0.1) que adiciona `is-visible` quando entrar viewport, com `transition-delay: var(--reveal-delay)`. Skip se `prefers-reduced-motion: reduce` — neste caso adiciona `is-visible` imediatamente.
- [ ] Já existe `<noscript>` fallback que força `[data-reveal] { opacity: 1; transform: none }` — atualizar selector para `.reveal`.

**Verify:** scrollar `/` — KPIs aparecem com fade+up; reduced-motion → visível imediato sem animação.

#### 3.2 — `src/components/ui/AnimatedNumber.tsx` (criar — React island)

- [ ] Props: `value: number`, `format?: (n: number) => string` (default `Intl.NumberFormat('pt-BR')`), `durationMs?: number` (default 1200), `prefix?: string`, `suffix?: string`.
- [ ] Estado inicial: 0. Em `useEffect`, IntersectionObserver no próprio nó; quando `isIntersecting`, anima de 0 a `value` via `requestAnimationFrame` com easing `easeOutCubic`.
- [ ] Respeita `prefers-reduced-motion`: skip animation, render `format(value)` direto.
- [ ] Wrapper `<span class="tabular-nums">` (DESIGN.md § 3 rule).
- [ ] `aria-live="polite"` para screen readers.

**Verify:** Hidratar via `client:visible` em `/index.astro` KPI cards. Recarregar página, scrollar até KPIs — números contam de 0 ao final em ~1.2s.

#### 3.3 — `src/components/ui/Spotlight.astro` (criar — opcional, light-touch)

- [ ] Background gradient sutil seguindo cursor: `<div class="spotlight-bg" />` com `radial-gradient(circle at var(--mx) var(--my), var(--color-secondary-container) 0%, transparent 40%)` opacity 0.15.
- [ ] Inline script com `mousemove` que seta `--mx` e `--my` em `--mx`/`--my` (vars locais), throttled para 16ms.
- [ ] Apenas usado no hero do landing, viewport ≥ lg. Skip mobile (CPU + UX).

**Verify:** mover cursor no hero — gradient sutil follows; CLS = 0 (gradient é absolute pos); mobile não renderiza (media query ≥ 1024).

#### Done when (Sprint 3)
- [ ] `Reveal.astro`, `AnimatedNumber.tsx`, `Spotlight.astro` criados
- [ ] 0 dependências adicionadas (puro CSS + DOM API)
- [ ] Bundle JS prerendered pages ≤ 50 KB
- [ ] `bunx astro check` 0 erros
- [ ] reduced-motion guard funciona em todos os 3

#### Out of scope (Sprint 3)
- Page transitions Astro `transition:animate` (defer — adiciona overhead, requer rewrite de `<a>` para `<a transition:name>`)
- Parallax hero (CLS risk + mobile perf)
- Sparkles/particles (banido pela DESIGN.md)

---

### Sprint 4 — Page-level visual refresh

**Scope:** aplicar tokens dark + animation utilities + shadcn primitives nas 6 páginas chave. Single-component-per-step para manter atomicidade.

#### 4.1 — `src/pages/index.astro` (landing)

- [ ] Hero (linhas 56–92): substituir gradient atual por composição mais editorial — left col 60% (`col-span-7`) com headline + CTAs, right col 40% (`col-span-5`) com `<Image>` de Rio Negro (placeholder via `<div>` com gradient se não houver foto). Aplicar `Spotlight` no container do hero.
- [ ] Trust bar (95–110): wrap em `<Reveal>` com `delay={150}`. Manter ícones Lucide sem alteração.
- [ ] Nossa Missão (113–170): trocar `<div>` decorativo (158–167) por `<picture>` com `loading="eager"` se foto Rio Negro disponível; senão manter gradient mas adicionar `border border-outline-variant/30`. Wrap a coluna esquerda em `<Reveal>`.
- [ ] Impacto em Números (172–204): substituir `<p>` dos números por `<AnimatedNumber value={…} format={…} client:visible>`. Cada Card em `<Reveal delay={i*100}>`.
- [ ] Itens Urgentes (206–250): cada `<ItemCard>` em `<Reveal delay={i*120}>`. Manter resto.

**Verify:** scrollar `/` em Chrome DevTools Performance — sem layout shift > 0.05; Lighthouse Performance ≥ 95.

#### 4.2 — `src/pages/doar/index.astro` (listing)

- [ ] Substituir filtros atuais (`<select>`) por `<Tabs>` (shadcn) com 4 tabs: "Todos", "Urgentes", "Por categoria", "Próximos do alvo". Hidratado `client:visible`.
- [ ] Grid de items: cada Card em `<Reveal delay={i*60}>` (capped at 600ms — após 10 items, todos com 600 delay).
- [ ] Adicionar barra de busca (input) — opcional MVP+1.

**Verify:** trocar tabs — transição de fade entre painéis; sem CLS; teclado funciona (radix tabs nativo).

#### 4.3 — `src/pages/doar/[slug].astro` (detail)

- [ ] Wrap `<DonationForm>` (já island) em `<Dialog>` (shadcn) — botão "Doar agora" abre modal Pix em vez de inline form. Modal preserva focus, ESC fecha.
- [ ] Migrar `<PixPanel>` interno do dialog: countdown timer com `aria-live="polite"`, QR `<img>` com explicit `width`/`height`.
- [ ] Substituir todos os `console.log`/`alert` em `DonationForm.tsx` por `toast()` do `sonner`.
- [ ] Sticky bottom CTA em mobile (`<button>` fixed bottom-0 visível < lg) — ativa Dialog.

**Verify:** mobile (375 px DevTools): bottom CTA visível, abre dialog; desktop: dialog abre com fade overlay; ESC fecha; trap funciona.

#### 4.4 — `src/pages/prestacao-de-contas.astro`

- [ ] Substituir grid simples por `<StickyScrollReveal>` (shadcn aceternity) listando `accountability_entries`. Cada entrada com title + amount + status badge + `is_public` toggle visível.
- [ ] Status badge tom mapping per DESIGN.md § 4.5: `concluido` → success, `em_transporte` → in-transport, `urgente` → urgent.
- [ ] Reveal staggered nos cards.

**Verify:** scroll lento da página — texto + sidebar de imagem trocam em sync; reduced-motion → estilo estático.

#### 4.5 — `src/pages/admin/index.astro` (dashboard)

- [ ] KPIs do topo com `<AnimatedNumber>` (BRL formatter) + `<Reveal>`.
- [ ] Tabela de items: hover row com `bg-surface-container-low` (já no DESIGN.md § 4.3).
- [ ] Sidebar logs: cada item em `<Reveal delay={i*40}>`.

#### 4.6 — `src/pages/admin/login.astro` + `src/pages/admin/items/{new,[id]/edit}.astro` + `src/pages/admin/settings.astro`

- [ ] Login: dark mode visual check (form bg `surface-container-low` em ambos modos OK). Add toggle no canto superior direito.
- [ ] New/Edit forms: validar inputs Material-3 light + dark; substituir `alert()` por `sonner` toast.
- [ ] Settings: usar `<Tabs>` para separar "Geral", "Pix Bank", "Email", "Aparência" (último seção contém theme picker).

#### Done when (Sprint 4)
- [ ] 6 páginas atualizadas
- [ ] Lighthouse Performance ≥ 95 em `/`, `/doar`, `/prestacao-de-contas` (mobile + desktop)
- [ ] CLS = 0 em todas
- [ ] Inputs/forms preservam contraste light + dark per DESIGN.md § 2.8/2.9
- [ ] Mobile (375/768) sem horizontal scroll

#### Out of scope (Sprint 4)
- Refazer mockups Stitch para dark — visual pode divergir levemente, é esperado
- Image swap real para Rio Negro (depende de assets do cliente — placeholder gradient OK)

---

### Sprint 5 — QA Gate

**Scope:** validar todos os pré-requisitos DESIGN.md § 16 + AGENTS.md "Pre-Delivery Checklist".

#### Done when (Sprint 5)
- [ ] `bunx astro check` 0 erros, 0 warnings
- [ ] `bun run build` succeed sem missing-env warnings
- [ ] Lighthouse Performance/A11y/BP/SEO ≥ 95 em `/`, `/doar`, `/prestacao-de-contas` — both light + dark themes via DevTools emulation
- [ ] LCP < 2.5s, CLS = 0, INP < 100ms (DevTools Performance + Lighthouse)
- [ ] WebAIM contrast checker manual em pares: `on-surface`/`background`, `on-surface-variant`/`background`, `primary`/`background`, `secondary`/`background`, `error`/`background` — em **light e dark**
- [ ] grep `material-symbols` em `src/` → 0 hits
- [ ] grep `#[0-9a-fA-F]{3,6}` em `src/components/**/*.{astro,tsx}` → 0 hits (excluindo `pix.ts` library config)
- [ ] grep `dark:bg-` em `src/` → 0 hits (todas as cores via tokens, modo dark vai automático)
- [ ] grep `client:load` em `src/pages/**/*.astro` → 0 hits
- [ ] grep `href="#"` em `src/` → apenas skip-links (`#conteudo-principal`, `#admin-content`)
- [ ] Testar reduced-motion: DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → recarregar `/` — sem animação de reveal/counter
- [ ] Testar keyboard nav: Tab pelo header, ativar toggle com Enter/Space, fechar Pix Dialog com ESC
- [ ] FOUC check: localStorage='dark', recarregar `/` cinco vezes — nenhuma página flasha branco
- [ ] Bundle: `du -sh dist/_astro/*.js` — chunks de página estática ≤ 50 KB

---

## Critical Files (modify list)

| File | Sprint | Change |
|---|---|---|
| `src/styles/global.css` | 1, 2, 3 | `@custom-variant dark`, `.dark { … }` block, dark shadow vars, `:root` transition, `tw-animate-css` import, `.reveal` utility |
| `src/components/ui/ThemeToggle.tsx` | 1 | **CREATE** |
| `src/layouts/PublicLayout.astro` | 1, 4 | inline FOUC script, `bg-[#faf6f0]` → token, mount `<ThemeToggle client:idle>`, multi-color `theme-color` meta, `<noscript>` selector update |
| `src/layouts/AdminLayout.astro` | 1, 4 | inline FOUC script, `bg-[#faf6f0]` → token, mount `<ThemeToggle client:idle>` |
| `components.json` | 2 | `iconLibrary: "lucide"`, `tailwind.config: ""` |
| `src/components/ui/dialog.tsx` | 2 | **CREATE via shadcn** |
| `src/components/ui/sonner.tsx` | 2 | **CREATE via shadcn** |
| `src/components/ui/tabs.tsx` | 2 | **CREATE via shadcn** |
| `src/components/ui/sticky-scroll-reveal.tsx` | 2 | **CREATE via @aceternity** |
| `src/components/ui/Reveal.astro` | 3 | **CREATE** |
| `src/components/ui/AnimatedNumber.tsx` | 3 | **CREATE** |
| `src/components/ui/Spotlight.astro` | 3 | **CREATE** |
| `src/pages/index.astro` | 4 | hero asymmetric, AnimatedNumber + Reveal nos KPIs e items urgentes, Spotlight no hero |
| `src/pages/doar/index.astro` | 4 | shadcn Tabs filters, Reveal stagger nos cards |
| `src/pages/doar/[slug].astro` | 4 | DonationForm/PixPanel dentro de shadcn Dialog, sonner toasts, sticky bottom CTA mobile |
| `src/pages/prestacao-de-contas.astro` | 4 | StickyScrollReveal timeline |
| `src/pages/admin/index.astro` | 4 | AnimatedNumber + Reveal stagger nos logs |
| `src/pages/admin/login.astro` | 4 | ThemeToggle no canto |
| `src/pages/admin/settings.astro` | 4 | shadcn Tabs reorganizando seções |
| `src/components/donation/DonationForm.tsx` | 4 | substituir feedback inline por sonner toast |
| `src/components/donation/PixPanel.tsx` | 4 | wrap em Dialog content |
| `package.json` | 2 | adds `class-variance-authority`, `tw-animate-css` (dev), shadcn-deps via CLI |

---

## Reuse (LEVER — extend before create)

| Existing | Reuse for |
|---|---|
| `src/components/ui/Card.astro` | base de KPI cards no landing — não recriar |
| `src/components/ui/Button.astro` | manter, expandir variant `outline` para shadcn dialog footer |
| `src/components/ui/Badge.astro` | manter — `tone="success"` etc já mapeia status corretos |
| `src/components/ui/ProgressBar.astro` | manter — track/fill já tokenizados |
| `src/components/ui/Icon.astro` + `src/lib/icons.tsx` | mantém Lucide-only — não trocar por radix-icons |
| `src/lib/utils.ts` (`cn`) | reutilizar em todos os shadcn novos |
| `src/components/donation/DonationForm.tsx` | manter lógica, refactor apenas UI feedback (sonner) |
| `<noscript>` block em PublicLayout | já existe — só atualizar selector `.reveal` |

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| FOUC quando dark mode persistido em localStorage | High | Inline blocking script no `<head>` antes do CSS — adiciona ~700 bytes mas elimina flash |
| Tailwind v4 `@custom-variant dark` syntax incorreta | Medium | Antes de Sprint 1, fetch via `mcp__claude_ai_Context7__query-docs` "tailwindcss" — confirmar API atual |
| `bunx shadcn add` falha por falta de `tailwind.config.js` | Medium | Workaround: criar `tailwind.config.js` shim vazio (`export default {}`) se CLI insistir; ou rodar com `--config none` flag |
| Bundle JS > 50 KB após shadcn primitives | Medium | Cada radix primitive ~5-12KB gz. Lazy-hidratar com `client:visible`. Se exceder, mover Tabs/Dialog para `client:load` apenas em rotas que precisam |
| View Transitions API quebrar em Firefox | Low | API tem `if ('startViewTransition' in document)` guard — fallback CSS de 240ms. Firefox 130+ tem suporte; versões anteriores caem no fallback |
| Toggle de tema causa shift de layout em fontes diferentes (system fonts) | Low | Mantemos Inter como single family — sem font swap entre modos |
| Color transition aplicada globalmente causa "wave" em hover de buttons | High | Solução: adicionar transition apenas em `.theme-transitioning *` (classe momentânea durante swap, removida após 250ms). Hover normal usa transitions próprias dos componentes |
| Lighthouse penalize por inline script | Low | Script é pequeno + necessário (FOUC); CSP pode requerer `'unsafe-inline'` ou nonce. Documentar em `astro.config.mjs` se CSP for adicionado depois |
| Contraste falha em dark `secondary-container` `#0e5138` + texto `#b1f0ce` | Low | DESIGN.md § 2.9 já validou ~7.5:1 AAA — manter exatamente esses hex |

---

## Verification (end-to-end)

```bash
# 1. Type + build gates
bunx astro check
bun run build

# 2. Dev server smoke
bun run dev
# → abrir http://localhost:4321 em Chrome
# → DevTools Application tab: limpar localStorage
# → recarregar — light mode esperado
# → clicar toggle: dark mode com transição clip-path circle ~250ms
# → recarregar (Ctrl+R) — abre direto em dark, sem FOUC
# → DevTools Rendering: "Emulate prefers-reduced-motion: reduce" → toggle instantâneo
# → DevTools Rendering: "Emulate prefers-color-scheme: dark" + localStorage = 'system' → dark

# 3. Lighthouse (CI-ready commands)
bunx lighthouse http://localhost:4321 --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --output=json --output-path=./lh-mobile-light.json
# → repetir com :4321/doar e :4321/prestacao-de-contas
# → todas as 4 categorias ≥ 95

# 4. Contrast audit
# → WebAIM Contrast Checker (manual) com pares de DESIGN.md § 2.8 e § 2.9
# → axe DevTools extension: 0 violations em / e /admin

# 5. Bundle check
du -sh dist/_astro/*.js
# → maior chunk de página estática ≤ 50 KB

# 6. Regression grep
grep -r "material-symbols" src/         # → 0
grep -rE "#[0-9a-fA-F]{3,6}\b" src/components/ src/pages/ src/layouts/  # → apenas pix.ts (lib config)
grep -r "dark:bg-" src/                 # → 0 (modo dark via .dark{} tokens, não dark: prefix)
grep -r "client:load" src/pages/        # → 0
grep -rE 'href="#"' src/                # → apenas skip-links
```

---

## Implementation Phasing (recommended)

```
Sprint 1 (foundation)
   └─ block: Sprint 2 e 4 dependem dos tokens dark + toggle estarem live
Sprint 2 (shadcn install)
   └─ block: Sprint 4 usa Dialog/Sonner/Tabs/StickyScrollReveal
Sprint 3 (animation utils)
   └─ paralelo a Sprint 2 (sem dependência cruzada — pode executar)
Sprint 4 (page polish)
   └─ depende de 1+2+3
Sprint 5 (QA)
   └─ depende de 4 completo
```

**Comando de execução:** após aprovação deste plano via `ExitPlanMode`, rodar `/implement` apontando para este arquivo. O harness deve carregar `frontend.md` + `DESIGN.md` + `stability.md` para cada agent de implementação. Para cada Sprint:

1. spawn `frontend-specialist` (foreground — precisa de write perms)
2. validar com `verification` agent (Playwright em http://localhost:4321) ao final
3. gate de avanço: Sprint contract `Done when` 100% checked antes de passar pro próximo

---

## Open Questions (defer to user if needed)

Nenhuma bloqueante — todas as ambiguidades resolvidas via assunções explícitas acima. Se o cliente insistir no tom warmer `#faf6f0` em headers (vs `surface-container-lowest #ffffff`), reverter Sprint 1.3 segunda bullet adicionando token dedicado `--color-header-bg` (light `#faf6f0`, dark `#0a0d0b`).

---

## References

- `.claude/rules/DESIGN.md` — token authority (§ 2.2–2.6 dark hex, § 2.9 contrast pairs, § 7 dark shadows, § 16 future activation)
- `.claude/rules/frontend.md` — render mode + hydration + accessibility rules
- `.claude/rules/stability.md` — Pre-Delivery Checklist
- `AGENTS.md` § Performance Gates — Lighthouse 95 + 50 KB JS budget
- `components.json` — registries cadastrados (kokonutui, tailark, cult-ui, reui, react-bits, aceternity)
- Librarian survey artifact (resposta inline) — picks por registry + slugs validados

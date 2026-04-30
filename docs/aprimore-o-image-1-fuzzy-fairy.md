# Plano — Refino Visual + Fix Layout (Footer, Hero, Cards, Login, Mobile)

## Context

Site público em produção apresenta problemas visuais claros nas screenshots fornecidas:

1. **Footer** — texto descritivo com largura intrínseca (cada palavra em uma linha vertical), CNPJ falso (`00.000.000/0001-00`), e-mail de contato falso (`contato@missaoamazonica.org`), coluna "Contato" inteira inútil.
2. **Cards "Itens Urgentes"** — placeholder genérico (ícone de árvore sobre gradiente) em vez de fotos reais. Reduz credibilidade da prestação de contas.
3. **Hero (card "Rio Negro · AM")** e **Seção Missão (card "Rio Negro · AM")** — texto colapsando em largura mínima dentro do bloco gradient (cada palavra em linha separada).
4. **Página Transparência (empty state)** — mesmo sintoma de colapso vertical no `EmptyState`.
5. **Login admin** — formulário com aparente largura ~80px, labels e título quebrando caractere por caractere; visualmente sem identidade.

A causa visual recorrente é o padrão `flex items-center justify-center` sem `w-full` no filho interno + `max-w-xs/max-w-md` resolvendo para largura intrínseca (`min-content`). Para cada caixa "Rio Negro · AM" o problema é estrutural: o conteúdo é decorativo e poderia ser uma foto real.

8 fotos reais já estão em `docs/fotos/` (3 originais + 5 adicionadas pelo usuário). Análise de conteúdo concluída — cada foto mapeada para uma superfície específica em § A (logo, hero, missão, login, /doar header, /prestacao header, e 2 ItemCards). 4 ItemCards sem foto direta (Filtros, Kits Primeiros Socorros, Cestas Básicas, Placas Solares) recebem ilustrações compostas (gradient categoria + padrão decorativo + ícone Lucide grande) via componente novo `ItemIllustration.astro` — § A.1.

Resultado pretendido: páginas mais limpas, menos texto vertical desperdiçado, sem dados mockados/quebrados, com fotos reais nos pontos de maior visibilidade, e login admin com visual de produto sério integrado ao Supabase.

---

## Critical files

| Arquivo | Mudança |
|---|---|
| `src/layouts/PublicLayout.astro` | Footer enxuto · remover CNPJ + e-mail + coluna Contato · remover e-mail do JSON-LD · normalizar typography do disclaimer |
| `src/pages/index.astro` | Hero card → foto real · Missão card → foto real · ajustes mobile |
| `src/pages/prestacao-de-contas.astro` | Empty state width fix · remover botão `mailto:` quebrado |
| `src/pages/admin/login.astro` | Layout split com brand panel + form · forgot-password modal · width-fix defensivo |
| `src/pages/admin/redefinir-senha.astro` (novo) | Tela de definição de nova senha pós-link de email |
| `src/pages/api/admin/auth/forgot.ts` (novo) | Endpoint POST que chama `resetPasswordForEmail` |
| `src/pages/doar/index.astro` | Verificar header responsivo + filtros mobile |
| `src/components/donation/ItemCard.astro` | Adicionar prop `categorySlug` · usar `<ItemIllustration>` quando sem foto |
| `src/components/donation/ItemIllustration.astro` (novo) | Composição programática gradient + padrão + ícone Lucide grande para cards sem foto |
| `src/components/ui/EmptyState.astro` | `w-full` no wrapper interno para travar largura |
| `supabase/seed.sql` | `image_url` real para 3 itens publicados (Filtros, Material Escolar, Barco Hospital) · remover CNPJ falso de `settings` · marcar `cnpj` como `null` ou remover |
| `public/images/mission/` (novo) | Receber `01.jpg`, `02.jpg`, `03.jpg` movidos de `docs/fotos/` |

---

## Fix groups

### A · Photo asset preparation

8 fotos analisadas em `docs/fotos/`. Mapeamento por adequação de conteúdo a cada superfície:

| Slot | Foto fonte | Conteúdo | Destino |
|---|---|---|---|
| Logo brand (header + footer + login + favicon + og) | `WhatsApp Image 2026-04-30 at 07.48.01.jpeg` | Identidade circular "missão AMAZÔNIA" com árvore-pessoa | `public/images/brand/logo.png` + `public/favicon.png` + `public/og-default.jpg` |
| Hero (home) | `WhatsApp Image 2026-04-24 at 14.20.57.jpeg` | Equipe missionária (~30 pessoas em camisetas marrom) à beira do Rio Negro sob copa verde | `public/images/mission/hero-equipe-rio-negro.jpg` |
| Seção "Nossa Missão" | `WhatsApp Image 2026-04-30 at 11.23.13 (2).jpeg` | Missionária com boné Amazônia interagindo com 2 crianças pequenas | `public/images/mission/section-cuidado-criancas.jpg` |
| Login admin brand panel | `WhatsApp Image 2026-04-29 at 14.18.49.jpeg` | Pastor abençoando idosa ribeirinha, jovem assistente ao lado (momento espiritual) | `public/images/mission/login-bencao.jpg` |
| `/doar` header strip | `WhatsApp Image 2026-04-30 at 11.23.13.jpeg` | Reunião com mulheres comunitárias em cadeiras verdes, missionária apresentando | `public/images/mission/doar-reuniao-comunidade.jpg` |
| `/prestacao-de-contas` header strip | `WhatsApp Image 2026-04-30 at 11.23.13 (3).jpeg` | Equipe em pé conversando frente a casa de madeira | `public/images/mission/prestacao-equipe-campo.jpg` |
| ItemCard "Material Escolar 2026" | `WhatsApp Image 2026-04-30 at 11.23.13 (1).jpeg` | Crianças sentadas em círculo na manta azul à beira do rio aprendendo | `public/images/items/material-escolar.jpg` |
| ItemCard "Barco Hospital Sal da Terra" | `WhatsApp Image 2026-04-30 at 11.23.14.jpeg` | Atendimento médico (mulher ribeirinha + bebê + missionária consultando) | `public/images/items/barco-hospital.jpg` |
| ItemCard "Filtros de Água para São Gabriel" | sem foto direta | — | usar fallback ilustrativo (§ E) |
| ItemCards "Kits Primeiros Socorros", "Cestas Básicas", "Placas Solares" | sem foto direta | — | usar fallback ilustrativo (§ E) |

Operações:

1. Criar `public/images/mission/`, `public/images/items/`, `public/images/brand/`.
2. Copiar (não mover — manter backup em `docs/fotos/`) renomeando conforme tabela.
3. **Logo**: a foto `07.48.01.jpeg` é uma renderização da logo num círculo. Recortar fundo escuro, exportar como PNG transparente em 256×256 e 32×32 (favicon). Usar no header (`PublicLayout.astro` linha 104) substituindo o atual `<Icon name="hand_heart">`.
4. Compressão opcional via `sharp` se >400KB. As fotos atuais (29KB–682KB) podem ficar como estão — Vercel CDN comprime/converte para WebP.
5. Gerar `public/og-default.jpg` (1200×630) — recortar `hero-equipe-rio-negro.jpg` no centro-horizontal e overlay com logo + texto "Missão Amazônica · Sal da Terra".

### A.1 · Fallback ilustrativo "criar nova imagem" (§ E refinado)

Para os 4 ItemCards sem foto e qualquer outro slot sem cobertura, criar componente `ItemIllustration.astro` (novo, em `src/components/donation/`) que renderiza:

```astro
---
interface Props { categorySlug: string; itemSlug: string; }
const palette: Record<string, { from: string; via: string; to: string; icon: string }> = {
  'saude':          { from: 'from-error-container/40',     via: 'via-tertiary-fixed-dim/30',  to: 'to-surface-container',  icon: 'stethoscope' },
  'alimentacao':    { from: 'from-tertiary-container/40',  via: 'via-tertiary-fixed-dim/30',  to: 'to-surface-container',  icon: 'shopping_basket' },
  'educacao':       { from: 'from-secondary-container/40', via: 'via-secondary-fixed-dim/30', to: 'to-surface-container',  icon: 'menu_book' },
  'infraestrutura': { from: 'from-primary-container/30',   via: 'via-secondary-container/40', to: 'to-surface-container',  icon: 'water_drop' },
  'logistica':      { from: 'from-primary-container/30',   via: 'via-primary-fixed-dim/30',   to: 'to-surface-container',  icon: 'directions_boat' },
  'comunidade':     { from: 'from-secondary-container/40', via: 'via-primary-fixed-dim/30',   to: 'to-surface-container',  icon: 'groups' },
};
const itemIconOverride: Record<string, string> = {
  'placas-solares-portateis': 'wb_sunny',
  'kits-de-primeiros-socorros': 'medical_services',
};
---
```

Renderiza:
- Gradient base 3-stops (Material 3 tonal)
- Decorative dot grid pattern overlay (`bg-[url(...)]` ou `<svg>` repetido)
- Ícone Lucide central 80px com `text-primary-container/60`
- Pequeno chip "Foto em breve" no canto inferior

Substitui o fallback genérico do ItemCard (linhas 54-58). ItemCard.astro testa `imageUrl` — se `null`, renderiza `<ItemIllustration />` em vez do bloco gradient atual com `<Icon name="forest">`.

Esta é a "imagem criada" para os slots sem foto: composição programática (gradient + padrão + ícone + microtexto) — não é foto raster, mas é uma "illustration component" diferente para cada categoria, evitando o efeito repetitivo de "todas as cards parecem iguais".

### B · Footer (PublicLayout.astro `181-210`)

Substituir grid 4-col por layout 2-col enxuto:

```
[brand + 1 linha de descrição curta]   [Plataforma: links]
[© 2026 · CNPJ N/D ou removido]
```

Mudanças concretas:
- Remover toda a coluna "Contato" (e-mail falso + endereço sem propósito).
- Encurtar descrição: "Atuando no Rio Negro com transparência total." (~7 palavras vs 20).
- Remover CNPJ da linha de copyright (manter "© 2026 Missão Amazônica – Sal da Terra"). Se houver CNPJ real depois, vem de `settings.cnpj` via fetch SSR.
- Reduzir padding: `py-12` → `py-8`. Reduzir `gap-8` → `gap-6`.
- Garantir `w-full` no `<div class="md:col-span-2">` e remover `max-w-md` do `<p>` de descrição (o grid já constringe a largura).

JSON-LD `contactPoint` (linhas `90-95`): remover bloco — não publicar e-mail falso para indexador. Se houver e-mail real depois, restaurar.

### C · Hero card (index.astro `112-125`)

Substituir todo o bloco do card decorativo por `<img>` real (foto da equipe à beira do rio):

```astro
<Reveal delay={420} class="lg:col-span-5 hidden lg:block">
  <div class="relative aspect-[4/3]">
    <div class="absolute inset-0 bg-secondary/15 translate-x-3 translate-y-3 rounded-3xl"></div>
    <img
      src="/images/mission/hero-equipe-rio-negro.jpg"
      alt="Equipe da Missão Amazônica reunida à beira do Rio Negro, vestindo camisetas marrom da missão"
      width={760}
      height={570}
      loading="eager"
      fetchpriority="high"
      class="relative w-full h-full object-cover rounded-3xl border border-outline-variant/30 shadow-card"
    />
    <div class="absolute bottom-md left-md right-md bg-primary/85 backdrop-blur-sm text-on-primary p-md rounded-2xl border border-on-primary/10">
      <p class="font-display text-xl mb-1">Rio Negro · AM</p>
      <p class="type-caption opacity-90">Equipe missionária atuando todo abril com comunidades ribeirinhas.</p>
    </div>
  </div>
</Reveal>
```

Texto agora dentro de bloco `<p>` em container com largura definida — não há mais colapso para min-content.

### D · Mission section card (index.astro `193-202`)

Substituir card decorativo por `<img>` apontando para `/images/mission/section-cuidado-criancas.jpg` (missionária com 2 crianças). Mesmo padrão da Hero — aspect-4/3, border outline-variant/30, overlay legenda inferior:

```
"Cuidado humano · Cada criança importa."
```

Alt-text descritivo: `"Missionária da Missão Amazônica com duas crianças ribeirinhas"`.

### E · ItemCard fallback (ItemCard.astro `44-58`)

Quando `imageUrl` é `null`, renderizar `<ItemIllustration categorySlug={...} itemSlug={...} />` (componente novo descrito em § A.1) em vez do bloco gradient atual com `<Icon name="forest">`.

ItemCard.astro precisa receber `categorySlug` como prop adicional (atualmente só recebe `categoryName`). Atualizar interface Props + chamadas em `index.astro` linha 290-300 e `doar/index.astro` linha 184-193 para passar `categorySlug={item.categories?.slug}`.

Os 3 ItemCards com foto (Material Escolar, Barco Hospital, Filtros — wait, Filtros não tem foto. Recheck) recebem `image_url` via seed em § I; os demais caem automaticamente no `<ItemIllustration>` por `image_url IS NULL`.

### F · EmptyState width fix (EmptyState.astro `14-23`)

Adicionar `w-full` no inner wrapper:

```astro
<div class="w-full flex flex-col items-center justify-center text-center py-xxl px-md gap-md">
  <span class="size-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
    <Icon name={icon} size={28} />
  </span>
  <div class="w-full max-w-md flex flex-col gap-1">
    <h3 class="type-h3 text-on-surface">{title}</h3>
    {description && <p class="type-body text-on-surface-variant">{description}</p>}
  </div>
  <slot />
</div>
```

### G · Prestação de Contas (`prestacao-de-contas.astro`)

- Linha `202-208`: remover botão `mailto:contato@missaoamazonica.org` (link quebrado). Substituir por link interno para `/doar` ou remover bloco "Próximos passos" — segunda card hoje só carrega esse CTA falho. Plano: trocar por bloco "Como acompanhar" com 2 itens informativos (texto + ícone) sem CTA externo.

### H · Login admin redesign (`admin/login.astro`)

Layout 2-col em desktop, stack em mobile:

```
┌──────────────────┬───────────────────────┐
│   Brand panel    │   Form panel          │
│   (foto 03)      │   - Logo Missão       │
│   gradient over  │   - Acesso admin h1   │
│   "Acesso        │   - email/senha       │
│   restrito"      │   - Entrar            │
│                  │   - Esqueci senha     │
│                  │   - ← Voltar ao site  │
└──────────────────┴───────────────────────┘
```

Estrutura:
- Substituir `<body class="...flex flex-col items-center justify-center...">` por `class="...grid grid-cols-1 lg:grid-cols-2..."`.
- Coluna esquerda (`lg:block hidden`): foto `03-equipe.jpg` + overlay `bg-primary/80` + texto branco "Acesso restrito · Operação da Missão Amazônica".
- Coluna direita: card existente (hoje em `<div class="bg-surface-container-lowest...">`) — adicionar `w-full max-w-md mx-auto` defensivo.
- Adicionar link "Esqueci minha senha" abrindo modal/dialog inline (sem nova rota). Modal contém input email + botão "Enviar link de recuperação".
- Submit → POST `/api/admin/auth/forgot` (nova rota, prerender=false). Handler:
  ```ts
  const { email } = await parseFormData(req);
  const { error } = await Astro.locals.supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/admin/redefinir-senha`,
  });
  // Sempre retorna 200 (anti-enum). Erro vai para Sentry.
  return Response.json({ ok: true });
  ```
- UI exibe toast verde "Se a conta existir, enviaremos um link em instantes." independentemente do resultado real (anti-enum).
- Página de redefinição `/admin/redefinir-senha` lê `?code=` de query, chama `supabase.auth.exchangeCodeForSession`, mostra form de nova senha, chama `supabase.auth.updateUser({ password })`. Inclui validação de senha mínima 8 chars.
- Configuração Supabase necessária: SMTP em Auth → Email Templates (assumido configurado pelo projeto; se não, e-mail só registra mas não envia — fluxo de UI segue funcional).
- Verificar config Supabase já wirado (Explorer confirmou `Astro.locals.supabase.auth.signInWithPassword` + `rpc('is_admin')` corretos). Nenhuma mudança de auth necessária além de adicionar reset.

Defensive width fix no card form: trocar `<div class="w-full max-w-md flex flex-col gap-lg">` por `<div class="w-full max-w-md mx-auto flex flex-col gap-lg" style="width: 100%; max-width: 28rem;">` — `style` inline garante render mesmo se Tailwind v4 falhar parsing de `max-w-md` (defesa em profundidade até confirmar que a regra está no CSS gerado).

### I · Seed data cleanup (`supabase/seed.sql`)

- Linha `78` (Material Escolar 2026): `image_url` → `'/images/items/material-escolar.jpg'`
- Linha `106` (Barco Hospital Sal da Terra): `image_url` → `'/images/items/barco-hospital.jpg'`
- Linhas `50, 64, 92, 122` (Filtros, Kits, Cestas, Placas Solares): manter `image_url = null` → cai em `<ItemIllustration>` (§ A.1)
- Linha `142`: trocar `'cnpj', '"00.000.000/0001-00"'::jsonb` por `'cnpj', 'null'::jsonb` (footer renderiza sem CNPJ até real ser informado)
- Linha `140`: `contact_email` — manter `'null'::jsonb`. Se layout precisar, lê de `settings`; sem valor → não renderiza link de e-mail.

Aplicar via `bun run db:push` ou `psql` direto na DB hospedada. Idempotente (já tem `on conflict do update`).

### J · Mobile responsiveness audit

Pontos a verificar com dev server em 375/768/1024/1440px:
- Header: menu hambúrguer mobile (linha `167-174` PublicLayout) — botão posicionado absoluto sobre o menu desktop; verificar se `data-mobile-menu-toggle` realmente abre menu (Explorer não confirmou wiring).
- `/doar` filtros: layout de filtros (linhas `89-166`) — em mobile cada select empilha; OK em código mas confirmar visual.
- Itens Urgentes na home: grid 1 col mobile, 3 col desktop — OK.
- Hero: imagem oculta em <lg, texto ocupa toda largura — OK.
- Footer: 1 col em <md, 2 col em md+ — após mudança, OK.

### K · Anti-trap audit (auto-rejeição)

| Trap | Status atual | Pós-mudança |
|---|---|---|
| Bento Trap (grid de boxes seguros) | parcial nas seções | manter assimetria 7/5 do hero · cards mantêm border-l accent |
| Glass Trap | sem blur excessivo | overlay legenda usa `bg-primary/85 backdrop-blur-sm` (controlado, com border) |
| Blue Trap | usa green primary | OK |
| Safe Split 50/50 | hero é 7/5 (asymmetric) | OK |
| Line Trap (bordas 1px sem propósito) | uso disciplinado de `outline-variant/30` | OK |
| Template test ("podia ser Vercel/Stripe?") | pendente após implementação | revalidar pós-build |

---

## Reuse map (LEVER — não recriar)

- `Icon.astro`, `Card.astro`, `Badge.astro`, `EmptyState.astro` — usar como estão; só `EmptyState` recebe fix de `w-full`.
- `Reveal.astro` — usar para fade-in da nova foto Hero.
- `formatBRL`, `progressPct` — sem mudanças.
- Helpers de tom em `badge-helpers` — sem mudanças.
- Fonts (Inter + Literata) já preconectadas em PublicLayout.
- Tokens semânticos (`bg-primary`, `text-on-primary`, `bg-surface-container-low`, etc.) já em `global.css` `@theme`.

Não criar novos componentes. Toda a mudança é via edição de arquivos existentes + adição de assets em `public/images/mission/`.

---

## Verification

### Quality gates

```bash
bun run typecheck      # astro check
# (sem lint script no package.json — biome rodar manual se necessário)
```

### Manual smoke (dev server)

```bash
bun run dev
```

Abrir `http://localhost:4321` e validar:

| Surface | Validação |
|---|---|
| `/` | Hero mostra foto da equipe à beira do rio · texto-overlay legível · 0 colapso vertical |
| `/` | Seção "Nossa Missão" mostra missionária + crianças no lado direito |
| `/` | Itens Urgentes — Material Escolar e Barco Hospital com fotos reais · Filtros (3º card publicado urgente) com `<ItemIllustration>` de Infraestrutura |
| `/` | Footer com 2 colunas · sem CNPJ · sem e-mail de contato · descrição em uma linha |
| `/` | Header mostra logo Missão Amazônica (PNG circular extraído da foto-logo) em vez do ícone hand_heart |
| `/doar` | Header strip mostra foto reunião comunitária · lista mostra fotos para 2 itens, ilustrações para 4 · filtros funcionam · mobile colapsa |
| `/prestacao-de-contas` | Header strip mostra foto equipe + casa · empty state centralizado e horizontal · sem botão `mailto:` quebrado |
| `/admin/login` | Layout split em desktop · foto bênção à esquerda com overlay primary · form à direita · link "Esqueci minha senha" abre modal |
| `/admin/login` mobile | Foto vira hero topo (h-48) · form abaixo full-width |
| `/admin/redefinir-senha?code=…` | Form 2 inputs de nova senha + confirmar · sucesso redireciona `/admin` |

### Mobile breakpoints (devtools)

- 375 (iPhone SE) — sem scroll horizontal · header colapsado · footer empilhado
- 768 (tablet) — header desktop · grid 2 col itens
- 1024 (laptop) — layout completo
- 1440 (desktop wide) — limite max-w-7xl

### Acessibilidade

- `prefers-reduced-motion` — Reveal já honra
- Foco visível em todos botões/inputs
- `<img>` com `alt` descritivo em pt-BR
- Login: focus order email → senha → entrar → esqueci → voltar
- Contraste WCAG AA mantido (tokens M3 já validados)

### Supabase / login

- POST `/admin/login` com credenciais válidas → redirect `/admin`
- Conta sem `is_admin=true` → redirect `/admin/login?error=not_admin` + mensagem visível
- Credenciais inválidas → mensagem "Credenciais inválidas." sem stack trace
- Botão "Esqueci minha senha" → preencher email → POST → toast "Enviamos um link…" (mesmo que SMTP do projeto não envie de fato, fluxo do client roda)

### Pós-deploy

Após `vercel deploy`:
- Confirmar fotos servidas com `Cache-Control: public, max-age=31536000`
- Lighthouse Performance ≥ 95 mobile/desktop
- LCP < 2500ms (foto Hero é o LCP candidate — preload no `<head>` se necessário em iteração futura)

---

## Out of scope (não fazer agora)

- Geração de imagens raster — depende de fotos extras do usuário em `docs/fotos/`.
- Reescrita do schema Supabase ou nova migração (apenas seed update).
- Adição de internacionalização para outras locales.
- Refatoração do menu mobile hambúrguer (botão existe mas wiring não confirmado — auditar em verificação; corrigir se quebrado dentro deste plano).
- Configuração SMTP do Supabase (assumido já configurado).

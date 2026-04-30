# NeonDash Clientes -- Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** Clientes (Patient/Client Management)
**Feature Area:** Clientes
**Created:** 2026-04-01
**Complexity:** L4 -- multi-section + state + interactions

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Colors](#2-colors)
3. [Typography](#3-typography)
4. [Layout Architecture](#4-layout-architecture)
5. [Component Inventory](#5-component-inventory)
6. [Detailed Sections](#6-detailed-sections)
7. [Animations](#7-animations)
8. [Responsive Behavior](#8-responsive-behavior)
9. [State Management](#9-state-management)
10. [Accessibility](#10-accessibility)
11. [Anti-Patterns](#11-anti-patterns)
12. [File Structure](#12-file-structure)
13. [Pre-Delivery Checklist](#13-pre-delivery-checklist)
14. [Success Criteria](#14-success-criteria)

---

## 1. Design System Overview

### Aesthetic Vision

The Clientes module manages sensitive patient/client data across clinical and mentorship contexts. The design must communicate **clinical precision** and **trust** while handling high data density with clear visual hierarchy. This is a data-rich, professional workspace -- not a marketing surface.

### Design Principles

| Principle | Application |
|-----------|-------------|
| **Clinical Precision** | Dense data rendered with clear typographic hierarchy. Medical values (height, weight, blood type) displayed in monospace for instant readability. Every field has purpose -- no decorative filler. |
| **Trust-Building** | LGPD consent status is always visible. Document signing flows include face detection, geolocation, and audit trails. Destructive actions require explicit confirmation dialogs. Gold accents on primary actions signal premium, authoritative quality. |
| **Data Density with Hierarchy** | The detail page packs six tabs of information (Perfil, Medico, Fotos, Documentos, Gestao, Chat). Tonal layering (surface hierarchy from GPUS tokens) separates content zones without visual noise. Cards float above background via background-color shifts, never drop shadows. |
| **Dual Context** | The module serves two personas: `clinica` (patients with medical records, procedures, before/after photos) and `mentoria` (students with course enrollments, payment tracking). The wizard and list views adapt layout and vocabulary per context. |

### Creative North Star Alignment

This module is the **Architectural Monolith** applied to a data workspace. Tonal gravity (dark mode: slate-950 void with gold accent actions) creates the premium clinical dashboard feel. The No-Line Rule is enforced: content sections within the detail page are separated by background shifts and generous whitespace (`p-6 md:p-8`), not `1px solid` dividers. Cards use `border-primary/10` -- a ghost border at ~10% opacity -- for minimal edge definition.

---

## 2. Colors

All colors reference GPUS semantic tokens. No hardcoded hex values.

### Core Semantic Tokens

| Token | Light Mode | Dark Mode | Usage in Clientes |
|-------|------------|-----------|-------------------|
| `--background` | `210 40% 98%` (Slate 50) | `222 47% 6%` (Slate 950) | Page background behind list/detail |
| `--foreground` | `203 65% 26%` (Azul Petroleo) | `210 40% 98%` (Slate 50) | Patient name, headings, primary text |
| `--card` | `0 0% 100%` (White) | `222 47% 10%` (Slate 900) | PatientInfoCard, PatientMedicalCard, PhotoGallery card surfaces |
| `--primary` | `38 60% 45%` (GPUS Gold) | `43 96% 56%` (Amber 400) | Primary buttons (Salvar, Adicionar), focus rings, icon accents, avatar ring |
| `--primary-foreground` | `0 0% 100%` | `222 47% 10%` | Text on gold buttons |
| `--muted` | `210 40% 96%` | `217 33% 17%` (Slate 800) | Empty state backgrounds, muted card regions |
| `--muted-foreground` | `215 25% 40%` | `215 20% 65%` (Slate 400) | Secondary text: phone, email, dates, labels |
| `--destructive` | `0 84% 60%` | `0 63% 31%` | Delete patient button, error states |
| `--success` | `142 76% 36%` | `142 76% 36%` | Active patient badge, "Depois" photo badge, signed consent |
| `--warning` | `38 92% 50%` | `43 96% 56%` | Overdue payment indicators, consent expiring soon |
| `--border` | `214 32% 91%` | `217 33% 17%` | Card ghost borders (`border-primary/10`), input field borders |
| `--ring` | `38 60% 45%` | `43 96% 56%` | Focus ring on inputs, avatar ring highlight |

### Status Badge Colors

| Badge | Token / Utility | Context |
|-------|-----------------|---------|
| Patient active | `bg-primary text-primary-foreground` | "Ativo" badge on patient card |
| Patient inactive | `bg-secondary text-secondary-foreground` | "Inativo" badge |
| Photo "Antes" | `bg-amber-500` | Photo type badge in gallery |
| Photo "Depois" | `bg-green-500` | Photo type badge in gallery |
| Photo "Evolucao" | `bg-blue-500` | Photo type badge in gallery |
| Photo "Simulacao" | `bg-purple-500` | Photo type badge (contextual use only -- not brand primary) |
| Document "Consentimento" | `bg-green-500/10 text-green-700` | Document type indicator |
| Document "Exame" | `bg-orange-500/10 text-orange-700` | Document type indicator |
| Document "Prescricao" | `bg-blue-500/10 text-blue-700` | Document type indicator |

### Timeline Event Colors

| Event Type | Dot Color | Border Accent |
|------------|-----------|---------------|
| Procedimento | `bg-primary text-primary-foreground` | `border-l-primary` |
| Foto | `bg-cyan-500 text-white` | `border-l-cyan-500` |
| Documento | `bg-green-500 text-white` | `border-l-green-500` |
| Chat IA | `bg-violet-500 text-white` | `border-l-violet-500` |
| Consulta | `bg-orange-500 text-white` | `border-l-orange-500` |
| Tratamento | `bg-rose-500 text-white` | `border-l-rose-500` |
| Consentimento | `bg-teal-500 text-white` | `border-l-teal-500` |

### Product Type Colors (List View Badges)

| Product Type | Light BG | Dark BG | Text Light | Text Dark |
|-------------|----------|---------|------------|-----------|
| Curso | `bg-blue-100/70` | `bg-blue-900/30` | `text-blue-700` | `text-blue-300` |
| Mentoria | `bg-purple-100/70` | `bg-purple-900/30` | `text-purple-700` | `text-purple-300` |
| Servico | `bg-emerald-100/70` | `bg-emerald-900/30` | `text-emerald-700` | `text-emerald-300` |
| Produto | `bg-amber-100/70` | `bg-amber-900/30` | `text-amber-700` | `text-amber-300` |

---

## 3. Typography

### Font Stack

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

### Role Mapping for Clientes

| Element | Font | Weight | Size | Tracking | Notes |
|---------|------|--------|------|----------|-------|
| Page title ("Clientes") | Manrope | Bold (700) | `text-2xl` / `text-3xl` | `tracking-tight` | Main page heading |
| Patient name (detail) | Manrope | Bold (700) | `text-xl` | Default | `CardTitle` in PatientInfoCard |
| Patient name (list card) | Manrope | Semibold (600) | `text-base` | Default | Truncated with `truncate` |
| Section headings | Manrope | Semibold (600) | `text-lg` | Default | "Galeria de Fotos", "Documentos", tab card titles |
| Tab labels | Inter | Medium (500) | `text-sm` | Default | NeonTabsTrigger content |
| Body text / descriptions | Inter | Regular (400) | `text-sm` / `text-base` | Default | CardDescription, observations, notes |
| Labels (form) | Inter | Medium (500) | `text-sm` | Default | FormLabel in edit dialogs, wizard steps |
| Metadata (dates, counts) | Inter | Regular (400) | `text-sm` | Default | "Atualizado em Mar 2026", photo counts |
| Medical values | **Fira Code** | Regular (400) | `text-sm` | Default | Height (cm), weight (kg), blood type, procedure costs |
| Patient ID / CPF / RG | **Fira Code** | Regular (400) | `text-sm` | Default | Numeric identifiers rendered in monospace |
| Currency values | **Fira Code** | Regular (400) | `text-sm` / `text-base` | Default | R$ 1.500,00 -- financial data in Gestao tab |
| KPI stat values | Manrope | Bold (700) | `text-2xl` | `tracking-tight` | PatientStats card numbers |
| KPI stat labels | Inter | Medium (500) | `text-sm` | Default | "Total de Pacientes", "Ativos" |
| Empty state text | Inter | Regular (400) | `text-sm` | Default | "Nenhuma foto adicionada", `text-muted-foreground` |
| Button labels | Inter | Medium (500) | `text-sm` | Default | "Salvar", "Cancelar", "Nova Foto" |
| Badge text | Inter | Medium (500) | `text-xs` | Default | Status badges, type badges |

### CRITICAL: Font Rules

- **Manrope** leads all headlines and patient names -- the distinctive geometric humanist font
- **Inter** serves as the functional body/UI companion for dense data screens
- **Fira Code** (monospace) for ALL numeric medical data: height, weight, measurements, IDs, currency
- **NEVER** use Fira Sans -- it is a different font family entirely
- Headline-to-body contrast: `text-2xl` (24px) vs `text-sm` (14px) -- 1.7x ratio is acceptable for data-dense pages (3x+ ratio reserved for marketing/hero surfaces)

---

## 4. Layout Architecture

### View A: List Page

The list page displays a context-aware patient/student list with stats, search, filters, and bulk actions.

```
+================================================================+
|  DashboardLayout > ScrollArea > PageContainer                   |
+================================================================+
|  [Context Selector: Clinica | Mentoria]                        |
+----------------------------------------------------------------+
|  [KPI Stats Row]                                               |
|  +----------+ +----------+ +----------+ +----------+           |
|  | Total    | | Ativos   | | Novos    | | Receita  |           |
|  | Pacientes| |          | | (Mes)    | | Produtos |           |
|  +----------+ +----------+ +----------+ +----------+           |
|  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4              |
+----------------------------------------------------------------+
|  [Search Bar]  [Filter: Status] [Filter: Produto] [+ Novo]    |
|  [Sort: A-Z | Recentes | Pagamento]  [Import] [Export]         |
+----------------------------------------------------------------+
|  [Bulk Action Bar] (visible when items selected)               |
|  [x selected] [Delete Selected] [Export Selected]              |
+----------------------------------------------------------------+
|  [Patient List]                                                |
|  +------------------------------------------------------------+|
|  | [ ] [Avatar] Nome Completo    Email    Telefone   Status  |||
|  |              Produtos badges  Parcelas info       [...]   |||
|  +------------------------------------------------------------+|
|  | [ ] [Avatar] Nome Completo    Email    Telefone   Status  |||
|  |              Produtos badges  Parcelas info       [...]   |||
|  +------------------------------------------------------------+|
|  ... (virtualized / paginated list)                            |
+----------------------------------------------------------------+
```

**Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` for KPI stats row.

**List items:** Card-based rows with checkbox selection, avatar, patient info, product badges, parcelas indicator, and actions dropdown.

### View B: Detail Page

The detail page renders a patient header card followed by a tabbed content area with six tabs.

```
+================================================================+
|  DashboardLayout > ScrollArea > PageContainer                   |
+================================================================+
|  [Back Button] / [Breadcrumb: Clientes > Nome do Paciente]     |
+----------------------------------------------------------------+
|  [PatientInfoCard]                                             |
|  +------------------------------------------------------------+|
|  | [Avatar 64x64]  Nome Completo          [Edit] [Actions v] |||
|  |                 25 anos | Ativo badge                      |||
|  | ---------------------------------------------------------- |||
|  | Phone: (11) 99999    | DOB: 15/03/2001                    |||
|  | Email: email@...     | Updated: Mar 2026                  |||
|  | Address: Rua...      |                                     |||
|  | ---------------------------------------------------------- |||
|  | Observacoes: ...                                           |||
|  +------------------------------------------------------------+|
|  grid gap-4 sm:grid-cols-2 (inside card content)              |
+----------------------------------------------------------------+
|  [NeonTabs]                                                    |
|  [Perfil] [Medico] [Fotos] [Documentos] [Gestao] [Chat]       |
+----------------------------------------------------------------+
|                                                                |
|  TAB: Perfil                                                   |
|  +---------------------------+ +-----------------------------+ |
|  | PatientTimeline           | | PatientStatsCard            | |
|  | (chronological events     | | (quick stats + actions)     | |
|  |  with filter chips)       | |                             | |
|  +---------------------------+ +-----------------------------+ |
|  grid-cols-1 lg:grid-cols-2 gap-6                              |
|                                                                |
|  TAB: Medico                                                   |
|  +---------------------------+ +-----------------------------+ |
|  | PatientMedicalCard        | | PatientConsentManager       | |
|  | (blood type, allergies,   | | (LGPD consent status,      | |
|  |  medications, history)    | |  consent history)           | |
|  +---------------------------+ +-----------------------------+ |
|  grid-cols-1 lg:grid-cols-2 gap-6                              |
|                                                                |
|  TAB: Fotos                                                    |
|  +------------------------------------------------------------+|
|  | PhotoGallery + PhotoComparison                              ||
|  | (grid/list toggle, filter by type, lightbox, upload)        ||
|  +------------------------------------------------------------+|
|                                                                |
|  TAB: Documentos                                               |
|  +------------------------------------------------------------+|
|  | DocumentManager                                             ||
|  | (table view, upload, preview, signing flow, search/filter)  ||
|  +------------------------------------------------------------+|
|                                                                |
|  TAB: Gestao                                                   |
|  +------------------------------------------------------------+|
|  | Financial sections: Matriculas, Pagamentos, Integrations    ||
|  | (AsaasSection, HublaSection, KiwifySection)                 ||
|  +------------------------------------------------------------+|
|                                                                |
|  TAB: Chat                                                     |
|  +------------------------------------------------------------+|
|  | AIChatWidget                                                ||
|  | (Gemini-powered chat with photo analysis, sessions)         ||
|  +------------------------------------------------------------+|
|                                                                |
+================================================================+
```

**Detail grid:** `grid-cols-1 lg:grid-cols-2 gap-6` for two-column tab content (Perfil and Medico tabs).

**Single-column tabs:** Fotos, Documentos, Gestao, and Chat occupy full width.

---

## 5. Component Inventory

### shadcn/ui Primitives Used

| Primitive | Usage Location |
|-----------|---------------|
| `Avatar` / `AvatarFallback` / `AvatarImage` | PatientInfoCard (header avatar with initials fallback), list item avatars, AIChatWidget message avatars |
| `Badge` | Status badges (ativo/inativo), photo type badges, document type badges, product type badges, consent status |
| `Button` | All action triggers: edit, delete, upload, navigate, submit, cancel, lightbox nav |
| `Card` / `CardContent` / `CardHeader` / `CardTitle` / `CardDescription` | Every section wrapper: info card, medical card, photo gallery, timeline, stats, consent manager |
| `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` | Edit patient, upload photo, upload document, add procedure, wizard steps, lightbox |
| `AlertDialog` (+ all sub-components) | Delete patient confirmation, delete procedure confirmation, revoke consent |
| `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage` | Patient edit form, wizard step forms, medical info form |
| `Input` | All text inputs: name, phone, email, CEP, search bar, procedure fields |
| `Textarea` | Observations, descriptions, medical history, document notes, chat message input |
| `Select` / `SelectContent` / `SelectItem` / `SelectTrigger` / `SelectValue` | Status select, photo type filter, document type filter, product select, gender, blood type |
| `Label` | Upload dialog labels, standalone form labels outside `Form` context |
| `Skeleton` | Loading states for photo grid, document list, timeline, medical card |
| `NeonTabs` / `NeonTabsList` / `NeonTabsTrigger` / `NeonTabsContent` | Detail page tab navigation (custom branded variant of Tabs) |
| `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | Document manager sub-tabs, AI chat session/comparison tabs |
| `ToggleGroup` / `ToggleGroupItem` | Photo gallery view mode toggle (grid vs list) |
| `ScrollArea` | AI chat message scroll, consent history scroll |
| `Separator` | Consent manager section dividers |
| `Tooltip` / `TooltipContent` / `TooltipProvider` / `TooltipTrigger` | Action button tooltips in list view |
| `DropdownMenu` (+ sub-components) | Patient row action menu (edit, delete, quick actions) |
| `Checkbox` | Bulk selection checkboxes in list view |
| `Collapsible` / `CollapsibleContent` / `CollapsibleTrigger` | Medical history expandable sections |
| `Accordion` / `AccordionContent` / `AccordionItem` / `AccordionTrigger` | Product grouping in mentoria list view |
| `Alert` / `AlertDescription` / `AlertTitle` | Medical allergy warnings, sync status alerts |
| `Popover` / `PopoverContent` / `PopoverTrigger` | AI chat photo picker, prompt suggestions |
| `RadioGroup` / `RadioGroupItem` | Document signing signer selection |
| `Table` / `TableBody` / `TableCell` / `TableHead` / `TableHeader` / `TableRow` | Document manager table view |
| `Compare` | Photo before/after slider comparison (Aceternity UI registry) |
| `AnimatedProgressBar` | Wizard step progress indicator |
| `FileUpload` | Wizard document attachment dropzone |

### Custom Components (Non-shadcn)

| Component | File | Purpose |
|-----------|------|---------|
| `PhotoGallery` | `photo-gallery.tsx` | Grid/list photo display with drag-drop upload, client-side compression, lightbox, and filter by type |
| `PhotoComparison` | `photo-comparison.tsx` | Before/after slider comparison using Aceternity `Compare` primitive |
| `DocumentManager` | `document-manager.tsx` | Full document lifecycle: upload, preview, digital signing with face detection + LGPD consent + geolocation, clinical terms panel |
| `AIChatWidget` | `ai-chat-widget.tsx` | Gemini-powered clinical chat with multi-session support, photo analysis, image generation, prompt suggestions |
| `PatientConsentManager` | `patient-consent-manager.tsx` | LGPD consent status display, grant/revoke actions, consent history with timestamps and IP |
| `PatientTimeline` | `patient-timeline.tsx` | Chronological event feed with type filtering, grouped by month, procedure CRUD inline |
| `AddPatientWizard` | `add-patient-wizard.tsx` | Multi-step dialog: Personal > Address > Medical > Business (context-dependent steps) |
| `CameraCapture` | `camera-capture.tsx` | WebRTC camera access for selfie capture during signing flow |
| `LGPDConsentStep` | `camera-capture.tsx` | LGPD consent checkbox step within document signing flow |
| `ClinicalTermsPanel` | `clinical-terms-panel.tsx` | Clinical terminology reference panel for document creation |
| `ConsultationReports` | `consultation-reports.tsx` | Consultation/report generation and display |
| `ProductFlipCard` | `product-flip-card.tsx` | 3D flip card for product/enrollment display in gestao tab |
| `PatientAdvancedSearch` | `patient-advanced-search.tsx` | Advanced multi-field search dialog |
| `ParcelasDetailSheet` | `parcelas-detail-sheet.tsx` | Sheet overlay showing detailed installment/parcela information |
| `GestaoIntegrations` | `gestao-integrations.tsx` | AsaasSection, HublaSection, KiwifySection -- payment gateway integration panels |
| `ClienteActionButtons` | `cliente-action-buttons.tsx` | Grouped action buttons for patient detail header (WhatsApp, email, etc.) |
| `ContextSelector` | `shared/context-selector.tsx` | Clinica/Mentoria context toggle (shared component) |
| `ProcedimentoSelector` | `shared/procedimento-selector.tsx` | Searchable procedure catalog picker |

---

## 6. Detailed Sections

### 6a. List Page Header + Search + Filters

**Layout:** Full-width header area with context selector, search input, filter selects, and action buttons arranged horizontally. Wraps to multiple lines on small screens.

**Search:** `Input` with `Search` icon, debounced (300ms), searches across `nomeCompleto`, `email`, `telefone`.

**Filters:**
- Status: `Select` with options "Todos", "Ativo", "Inativo"
- Produto: `Select` populated from `trpc.produtos.list` -- filter by enrollment
- Sort: `Select` with options "A-Z", "Recentes", "Pagamento"

**Actions:**
- `+ Novo Paciente` / `+ Novo Aluno` (context-dependent) -- opens `AddPatientWizard`
- Import button -- opens `ImportPatientsDialog` (CSV/XLSX via parserAgent)
- Export button -- downloads filtered list as CSV/XLSX
- Sync button -- `UnifiedSyncButton` for Asaas integration sync

### 6b. Patient Table with Bulk Selection

**Structure:** Card-based list items (not a traditional `<table>`) for better mobile responsiveness.

Each list item contains:
- `Checkbox` for bulk selection (left side)
- `Avatar` with initials fallback (64x64 on detail, smaller on list)
- Patient name (truncated), email, phone
- Product badges with type-specific colors (see Section 2)
- Parcelas indicator: `X/Y pagas` with overdue count highlighted in destructive color
- `DropdownMenu` with actions: Edit, View Details, Delete

**Bulk Action Bar:** Appears above list when `selectedIds.size > 0`:
- Shows count: "X selecionados"
- Actions: "Excluir Selecionados" (opens `DeleteManyPatientsDialog`), "Exportar Selecionados"

**Product grouping (Mentoria tab):** When `groupByProduct` is enabled, patients are grouped by product with `Accordion` items per product, and further sub-grouped by turma (class).

### 6c. Patient Detail Header Card (PatientInfoCard)

**Layout:** `Card` with `border-primary/10`. Header row uses `flex flex-row items-start justify-between gap-4`.

**Left cluster:**
- `Avatar` 64x64 (`h-16 w-16`) with `ring-2 ring-primary/20`
- AvatarFallback: initials from name, `bg-primary/10 text-primary font-semibold text-lg`
- Patient name as `CardTitle text-xl`, truncated
- Age calculation displayed next to status badge

**Right:** Ghost edit button (`variant="ghost" size="icon"`) with `Pencil` icon and `sr-only` label.

**Content grid:** `grid gap-4 sm:grid-cols-2` for two-column layout of contact info and additional info.

**Contact info column:** Phone (clickable `tel:` link), Email (clickable `mailto:` link), Address -- each with corresponding Lucide icon, `text-muted-foreground text-sm`, hover transitions `hover:text-primary`.

**Additional info column:** Date of birth, last updated date.

**Observations:** Full-width (`col-span-full`) with `border-t pt-2` divider.

**Edit dialog:** `Dialog` with `max-w-lg`, form fields for all patient fields, `Select` for status (ativo/inativo), `Textarea` for observations. Submit via `trpc.clientes.update.useMutation`.

### 6d. Info/Medical Tabs

**Perfil tab (grid-cols-1 lg:grid-cols-2 gap-6):**
- Left: `PatientTimeline` -- chronological event feed grouped by month, with filter chips for event types, expandable event details, inline procedure CRUD (create, edit, delete via dialogs)
- Right: `PatientStatsCard` -- quick stats and action shortcuts to other tabs

**Medico tab (grid-cols-1 lg:grid-cols-2 gap-6):**
- Left: `PatientMedicalCard`
  - Blood type, allergies (with warning alert), current medications, medical history (collapsible)
  - Weight and height displayed in **Fira Code** monospace
  - Aesthetic history (`antecedentesEsteticos`), expectations (`expectativas`)
  - Edit dialog with Zod-validated form
- Right: `PatientConsentManager`
  - LGPD consent status per type (dados_pessoais, marketing, fotos, compartilhamento)
  - Required vs optional consent types
  - Grant/revoke actions with confirmation dialogs
  - Consent history timeline with timestamps and IP addresses

### 6e. Financial Section (Gestao Tab)

**Matriculas section:**
- Product enrollment cards using `ProductFlipCard` (3D flip interaction)
- Add enrollment via `AddMatriculaDialog`
- Status: ativo, concluido, cancelado, pausado
- Each enrollment shows: product name, type, turma, status badge, valor pago

**Parcelas section:**
- Payment installments tracked per enrollment
- `ParcelasDetailSheet` -- slides in from right with detailed payment schedule
- Visual indicators: pagas (green), pendentes (yellow), atrasadas (red/destructive)

**Pagamentos section:**
- Manual payment entry via `AddPagamentoDialog`
- Fields: valor, forma de pagamento, data, status, descricao
- Currency values rendered in **Fira Code**

**Integration sections:**
- `AsaasSection` -- Asaas customer sync status, payment history from gateway
- `HublaSection` -- Hubla integration status
- `KiwifySection` -- Kiwify purchase/subscription status

### 6f. Document Manager

**Layout:** Full-width `Card` with search input, type filter `Select`, and upload button in header.

**Document list:** `Table` with columns: Tipo (icon + badge), Nome, Data, Status (signed/unsigned), Actions (preview, download, delete, sign).

**Upload flow:**
1. Drag-and-drop zone or file picker (accepted: PDF, DOC, DOCX, JPG, PNG, WebP; max 10MB)
2. Type selection: consentimento, exame, prescricao, outro
3. Notes/observations textarea
4. Base64 encoding and upload via `trpc.clientes.uploadDocument`

**Digital signing flow (5 steps):**
1. **Signer identification** -- name, Clerk ID lookup
2. **LGPD consent** -- checkbox with legal text (`LGPDConsentStep`)
3. **Selfie capture** -- WebRTC camera with face detection (`CameraCapture`)
4. **Signature** -- canvas-based signature pad
5. **Review and confirm** -- summary of evidence (hash, geolocation, IP, user agent, timestamp)

Evidence object (`SignerEvidence`) is stored alongside the document for audit compliance.

**Document preview:** `Dialog` with PDF/image rendering, print action, download link.

### 6g. Photo Gallery with Comparison

**PhotoGallery:**
- Header: title with photo count, view mode toggle (grid/list via `ToggleGroup`), "Nova Foto" button
- Filter: `Select` for photo type (Todos, Antes, Depois, Evolucao, Simulacao)
- Grid view: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3` with aspect-square thumbnails
  - Hover overlay: gradient from bottom, zoom icon, description text
  - Type badge (`tipoColors`) positioned `absolute top-2 left-2`
- List view: horizontal items with 64x64 thumbnail, type badge, area, description, date, AI analyze button
- Lightbox: `Dialog max-w-4xl bg-black/95` with prev/next navigation, full image, action buttons (Analyze with AI, Use for Comparison)

**Upload flow:**
1. Drag-and-drop or file picker (JPEG, PNG, WebP; max 5MB)
2. Client-side compression: full image resized to 1200px max dimension at 80% quality, thumbnail at 300px/60%
3. Type and region selection, description textarea
4. Progress states: "Comprimindo...", "Salvando..."

**PhotoComparison:**
- Uses Aceternity `Compare` component for slider-based before/after comparison
- Dropdown selectors for "before" and "after" photos filtered by type
- Swap button to invert comparison
- "Analyze with AI" button sends to AIChatWidget

### 6h. AI Chat Widget

**Structure:** `Card` with chat history in `ScrollArea`, message input at bottom.

**Message display:**
- User messages: right-aligned, `bg-primary/10` background
- Assistant messages: left-aligned with `Bot` avatar, `bg-muted` background
- System messages: centered, muted styling
- Image messages: inline thumbnail with expand capability

**Input area:**
- Auto-resizing text area (grows with content per AI UX guidelines)
- Photo attachment: popover with patient photo picker or camera icon
- Prompt suggestions: contextual examples ("Analise esta foto", "Sugira tratamento para...", "Gere simulacao de resultado")
- Send button with loading state (animated spinner during AI response)

**AI response patterns:**
- Skeleton loaders shaped like paragraphs during generation
- Progress labels: "Analisando...", "Gerando resposta..."
- Image generation: displays generated images inline with "Simulacao" badge
- Multi-session support: session selector/creator in header

### 6i. LGPD Consent Manager

**Layout:** `Card` with shield icon header, consent type list.

**Consent types displayed:**
1. **Dados Pessoais** (required) -- personal data processing
2. **Marketing** (optional) -- email/WhatsApp communications
3. **Fotos** (optional) -- before/after photo usage
4. **Compartilhamento** (optional) -- data sharing with third parties

**Each consent item shows:**
- Icon + label + description
- Status badge: `ShieldCheck` (granted, green) or `ShieldX` (not granted, destructive)
- Grant/revoke date with IP address
- Action button: Grant or Revoke (with confirmation dialog for revocation)

**Consent history:** `ScrollArea` with timestamped entries showing grant/revoke events.

**Animation:** `AnimatePresence` from `motion/react` for status transitions.

### 6j. Add Patient Wizard (Multi-Step)

**Container:** `Dialog` with `ScrollArea` for long step content.

**Progress indicator:** `AnimatedProgressBar` showing completion percentage, step dots with labels.

**Steps (context-dependent):**

**Clinica context (3 steps):**
1. **Dados Pessoais** (User icon): nomeCompleto, email, telefone, cpf, rg, cnpj (with CNPJ lookup via Nuvem Fiscal), convenio, numero carteirinha, genero, data nascimento
2. **Endereco** (MapPin icon): CEP (with auto-fill via ViaCEP API), logradouro, numero, complemento, bairro, cidade, estado
3. **Ficha Medica** (Heart icon): tipo sanguineo, alergias, medicamentos atuais, queixas principais, observacoes, document attachments

**Mentoria context (2 steps):**
1. **Dados Pessoais** (User icon): same personal fields
2. **Gestao Comercial** (HandCoins icon): product selection, enrollment creation, payment entry

**Step transitions:** `AnimatePresence` with `motion.div` slide animation, direction-aware (left/right based on navigation direction).

**Validation:** Per-step field validation via `form.trigger(fields)` before advancing. Zod schemas: `personalSchema`, `addressSchema`, `medicalSchema`, `documentSchema`.

**Submit:** Creates patient via `trpc.clientes.create`, uploads documents via `trpc.clientes.uploadDocument`, creates matriculas and pagamentos.

---

## 7. Animations

All animations use `motion/react` (NOT `framer-motion`). CSS transitions for hover/state changes. GPU-accelerated properties only (`transform`, `opacity`).

### Page-Level Animations

| Animation | Implementation | Duration | Trigger |
|-----------|---------------|----------|---------|
| KPI stats stagger | `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, stagger `delay: index * 0.1` | 300ms per card, 100ms stagger | Page load |
| Tab content crossfade | NeonTabs built-in transition | 200ms | Tab switch |

### Component Animations

| Animation | Implementation | Duration | Trigger |
|-----------|---------------|----------|---------|
| Wizard step slide | `AnimatePresence` + `motion.div` with directional slide (`x: direction * 50` to `x: 0`) | 300ms | Step navigation |
| Consent status toggle | `AnimatePresence` + `motion.div` with `opacity` + `scale` | 200ms | Grant/revoke consent |
| Photo hover scale | CSS `transition-transform duration-300 group-hover:scale-105` | 300ms | Mouse hover |
| Photo overlay reveal | CSS `transition-opacity duration-200 group-hover:opacity-100` | 200ms | Mouse hover |
| Lightbox open | Dialog built-in animation | 200ms | Photo click |
| Upload drag state | CSS `transition-all duration-200`, `scale-[1.02]` on drag over | 200ms | Drag enter/leave |
| Delete confirm shake | `animate-bell-shake` (custom utility) | 300ms | Delete button press |
| Card hover border | CSS `transition-colors hover:border-border` | 150ms | Mouse hover |
| Loading spinner | `animate-spin` on `Loader2` icon | Continuous | Mutation pending |

### Motion Rules

- `prefers-reduced-motion` MUST be respected: wrap all `motion.div` animations with `motion-reduce:` variant or check `window.matchMedia('(prefers-reduced-motion: reduce)')` before applying `initial`/`animate` props
- Total page stagger sequence: 4 stats cards * 100ms = 400ms total -- well within 800ms limit
- No `framer-motion` import -- the project uses `motion/react` package
- CSS transitions for all hover states -- never JS event handlers for hover animations (INP protection)
- Photo gallery hover uses `group-hover:` Tailwind pattern -- zero JS involvement

---

## 8. Responsive Behavior

### Breakpoint Strategy (Mobile-First)

| Breakpoint | List Page | Detail Page |
|------------|-----------|-------------|
| `< 640px` (mobile) | Single-column card list, stats 1-col, search full-width, filters stacked | Single-column layout, tabs scrollable horizontally, all sections stacked |
| `640px-1023px` (sm/md) | Stats 2-col, card list with more info visible, filters inline | Info card 2-col grid, tab content single-column |
| `>= 1024px` (lg) | Stats 4-col row, full card layout with all fields | Two-column tab content (Perfil, Medico), full photo grid 4-col |

### List Page Responsive Details

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| KPI Stats | `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-4` |
| Search + Filters | Stacked vertically | Inline with wrap | Single row |
| Patient cards | Full-width card, minimal info | More fields visible | Full info row with all fields |
| Bulk action bar | Sticky bottom sheet | Sticky top bar | Sticky top bar |
| Product badges | Hidden (space constraint) | First 2 shown | All shown |

### Detail Page Responsive Details

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| PatientInfoCard contact grid | Single column | `sm:grid-cols-2` | `sm:grid-cols-2` |
| NeonTabs | Horizontal scroll, no wrapping | All tabs visible | All tabs visible |
| Perfil tab (Timeline + Stats) | Stacked single column | Stacked | `lg:grid-cols-2 gap-6` |
| Medico tab (Medical + Consent) | Stacked single column | Stacked | `lg:grid-cols-2 gap-6` |
| Photo gallery grid | `grid-cols-2` | `sm:grid-cols-3` | `md:grid-cols-4` |
| Document table | Card-based list (no table) | Compact table | Full table with all columns |
| AI Chat messages | Full-width, smaller avatars | Standard layout | Standard layout |
| Lightbox | Full-screen, edge-to-edge | `max-w-4xl` centered | `max-w-4xl` centered |
| Wizard dialog | Near full-screen | `sm:max-w-lg` | `sm:max-w-lg` |
| Edit patient dialog | Near full-screen | `max-w-lg` | `max-w-lg` |

### Touch Targets

- All interactive elements: minimum 44x44px touch target
- Checkbox: `h-5 w-5` with adequate padding
- Icon buttons: `size="icon"` = 40x40px (meets 44x44px with padding)
- Photo grid items: aspect-square, minimum ~100px per item on 2-col mobile
- Tab triggers: `min-h-[44px]` with adequate horizontal padding

---

## 9. State Management

### State Hierarchy (per the Decision Framework)

| State Type | Implementation | Examples |
|------------|---------------|----------|
| **Server State** | TanStack Query via tRPC hooks | Patient list, patient detail, photos, documents, timeline, medical info, consents, chat sessions |
| **URL State** | TanStack Router `useSearch()` | `contexto` (clinica/mentoria), patient `id` parameter |
| **Component State** | `useState` | Edit dialog open/closed, lightbox photo, upload form fields, wizard step, filter values, view mode |

### tRPC Query Patterns

| Query | Key | `staleTime` | Refetch Strategy |
|-------|-----|-------------|-----------------|
| `clientes.list` | `{ contexto, search, filters }` | 30s | `keepPreviousData` for smooth pagination |
| `clientes.getById` | `{ id }` | 30s | Invalidated on update/delete mutations |
| `clientes.getTimeline` | `{ clienteId }` | 30s | Invalidated on procedure/document/photo mutations |
| `clientes.fotos.list` | `{ clienteId }` | 30s | Invalidated after upload, manual `refetch()` |
| `clientes.fotos.getComparacoes` | `{ clienteId }` | 30s | Read-only, standard invalidation |
| `clientes.procedimentos.list` | `{ clienteId }` | 30s | Invalidated on CRUD mutations |
| `clientes.infoMedica.get` | `{ clienteId }` | 30s | Invalidated on upsert mutation |
| `clientes.documentos.list` | `{ clienteId }` | 30s | Invalidated on upload/delete |
| `produtos.list` | `{}` | 30s | Invalidated on catalog changes |
| `procedimentos.list` | `{}` | 30s | Invalidated when catalog procedure created |

### Mutation Patterns (CRITICAL)

All mutations follow this pattern:

```typescript
const mutation = trpc.clientes.update.useMutation({
  onSettled: () => {
    // ALWAYS invalidate on onSettled, not onSuccess
    // This ensures cache is refreshed even on error
    utils.clientes.getById.invalidate({ id: patientId });
    utils.clientes.list.invalidate();
  },
  onSuccess: () => {
    toast.success("Paciente atualizado");
    closeDialog();
  },
  onError: (error) => {
    toast.error(error.message || "Erro ao atualizar");
  },
});
```

**NOTE:** Current codebase uses `onSuccess` for invalidation in several components (PatientInfoCard, PhotoGallery, PatientTimeline). This should be migrated to `onSettled` for robustness, with `refetch()` calls replaced by proper query invalidation.

### Upload State Machine (Photo/Document)

```
IDLE -> FILE_SELECTED -> COMPRESSING -> UPLOADING -> SUCCESS/ERROR -> IDLE
```

State tracked via combination of `selectedFile`, `isCompressing`, and `mutation.isPending`.

### Search/Filter State

- Search query: `useState<string>` with debounced value (300ms) for API call
- Filter tipo: `useState<string>` with immediate Select onChange
- Sort: `useState<string>` mapped to tRPC input parameter
- Bulk selection: `useState<Set<number>>` for selected patient IDs

### Wizard State

- Current step: `useState<number>` (0-indexed)
- Direction: `useState<number>` (-1 or 1) for animation direction
- Form: `useForm<FormValues>` with `zodResolver` -- persistent across steps
- Uploaded files: `useState<File[]>` for document attachments
- Matriculas: `useState<Array<MatriculaLocal>>` for enrollment entries
- Pagamentos: `useState<Array<PagamentoLocal>>` for payment entries

---

## 10. Accessibility

### Full Checklist

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| **WCAG 2.1 AA Contrast** | All text uses semantic tokens with 4.5:1+ ratio. `text-foreground` on `bg-background`, `text-muted-foreground` on `bg-card` verified. | Required |
| **Keyboard Navigation** | All interactive elements (buttons, links, inputs, selects, tabs, checkboxes) are natively focusable. Dialog focus trapping via Radix UI. Lightbox arrow key navigation. | Required |
| **Screen Reader Labels** | `sr-only` labels on icon-only buttons ("Editar paciente", "Fechar", "Foto anterior", "Proxima foto"). Photo grid items have `aria-label` with description. | Required |
| **Focus Indicators** | Gold focus ring (`--ring` token) on all interactive elements via Tailwind `focus-visible:ring-2 ring-ring`. | Required |
| **Semantic HTML** | `<button>` for actions (never `<a href="#">`), `<a>` for navigation/links (`tel:`, `mailto:`), `<form>` for data entry, `<table>` for document list. | Required |
| **Photo Alt Text** | Every `<img>` has `alt` attribute: photo description or "Foto" fallback, avatar alt via `AvatarImage`. Gallery thumbnails include type in alt. | Required |
| **Photo Comparison** | Before/after comparison slider must have descriptive text: "Arraste o slider para comparar as fotos". Both images must have distinct alt text ("Foto antes" / "Foto depois"). | Required |
| **Document Download Labels** | Download buttons include document name in accessible label: `aria-label="Baixar documento: {nome}"`. | Required |
| **Error Messages** | Form validation errors announced via `FormMessage` (associated with input via `aria-describedby`). Toast notifications use `role="status"`. | Required |
| **Loading States** | Skeleton loaders for async content. `aria-busy="true"` on loading containers. Mutation buttons show "Salvando..." text replacing label. | Required |
| **Reduced Motion** | All `motion.div` animations respect `prefers-reduced-motion`. CSS transitions use `motion-reduce:transition-none` variant. | Required |
| **Touch Targets** | All buttons >= 44x44px. Photo grid items large enough on mobile. Tab triggers adequately sized. | Required |
| **SC 2.4.11 Focus Not Obscured** | Focused elements not obscured by sticky headers. Detail page NeonTabs bar does not cover focused content below. | Required |
| **SC 2.5.7 Dragging** | Photo upload drag-and-drop has click alternative (file picker button). Document upload same. | Required |
| **SC 2.5.8 Target Size** | All touch targets minimum 24x24px with adequate spacing. Primary actions minimum 44x44px. | Required |
| **SC 3.3.7 Redundant Entry** | Wizard auto-populates address fields from CEP lookup. Medical info defaults carry forward. | Required |
| **Color Independence** | Status is never conveyed by color alone -- always includes text label ("Ativo"/"Inativo") or icon. Photo types have text badges alongside color. | Required |
| **RTL / i18n** | Currently pt-BR only. Layout uses logical properties where possible. | Future |

### Component-Specific Accessibility Notes

- **PhotoGallery lightbox:** Arrow keys navigate between photos. Escape closes. Focus trapped inside dialog. Photo counter announced ("Foto 3 de 12").
- **DocumentManager table:** Table has `<th>` headers. Row actions have descriptive labels. Status icons have title attributes.
- **AIChatWidget:** ScrollArea auto-scrolls to latest message. Input auto-focuses on tab switch. Message timestamps have `<time>` elements.
- **Wizard:** Step progress announced via `aria-label` on progress bar. "Passo 2 de 3". Back/Next buttons clearly labeled.
- **Consent Manager:** Grant/revoke dialogs include full consent text for screen reader users. Status changes announced.

---

## 11. Anti-Patterns

### FORBIDDEN Patterns for Clientes Module

| # | Anti-Pattern | Why It's Forbidden | Correct Approach |
|---|-------------|-------------------|-----------------|
| 1 | **Storing PII in component state unnecessarily** | Patient data (CPF, medical records, address) should not persist in React state beyond its usage scope. Memory leaks expose sensitive data. LGPD compliance requires minimizing data in memory. | Read PII from tRPC cache (TanStack Query). Pass to child components via props. Clear form state on dialog close. Never store PII in Zustand or Context. |
| 2 | **Multiple nested ScrollArea** | The page already has a root `ScrollArea` in `DashboardLayout`. Nesting additional `ScrollArea` components inside tabs or cards creates scroll traps and confusing UX. | Only use `ScrollArea` for bounded-height containers (AI chat messages, consent history). Tab content should flow naturally in the page scroll. Test by scrolling with trackpad -- if content gets "stuck", you have a nested scroll trap. |
| 3 | **Importing `framer-motion`** | The project uses `motion/react` (the Motion library). `framer-motion` is a different, heavier package. Importing it adds bundle weight and creates version conflicts. | Always import from `"motion/react"`: `import { motion, AnimatePresence } from "motion/react"`. |
| 4 | **Barrel imports from `lucide-react`** | `import { Icon } from 'lucide-react'` loads the entire icon library (~200KB). Destroys tree-shaking. | Import directly: `import Check from 'lucide-react/dist/esm/icons/check'`. NOTE: Current codebase uses barrel imports (needs gradual migration). New components MUST use direct imports. |
| 5 | **Creating `new Date()` or `new Intl.NumberFormat()` inside render** | Creates new objects on every render cycle. Particularly expensive in list items rendered 50+ times. Causes GC pressure and jank. | Hoist to module scope: `const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`. For dates, use a shared `formatDateBR()` utility. |
| 6 | **Using `onSuccess` instead of `onSettled` for query invalidation** | If a mutation errors after a partial server-side change, `onSuccess` won't fire, leaving the cache stale. The user sees outdated data. | Always invalidate in `onSettled`. Use `onSuccess` only for UI side effects (toast, close dialog). |
| 7 | **JS-driven hover animations** | Using `onMouseEnter`/`onMouseLeave` handlers to toggle animation classes. Triggers React re-renders on hover. Kills INP scores (must stay < 200ms). | Use CSS-only: `transition-all duration-200 hover:scale-105`, `group-hover:opacity-100`. The photo gallery correctly uses this pattern already. |
| 8 | **Hardcoded hex colors in component files** | `bg-[#0f4c75]`, `text-[#fbbf24]` bypass the design system. They don't adapt to dark/light mode. They scatter unmanaged values across the codebase. | Use semantic tokens: `bg-primary`, `text-foreground`, `border-border`. Use brand utilities: `text-neon-petroleo`, `bg-neon-gold`. |
| 9 | **`backdrop-blur` on new components** | Per GPUS Glass Trap rule: glassmorphism without solid borders fails contrast requirements. 42 legacy files use it; new code must not add more. | Use tonal layering: `bg-card` over `bg-background`. Surface hierarchy for depth. Ghost borders at 10-15% opacity for edge definition. |
| 10 | **Accessing camera without permission request** | `CameraCapture` component accesses WebRTC `getUserMedia`. Must always check permission status first and show a clear permission request UI before activating the camera stream. | Check `navigator.permissions.query({ name: 'camera' })` before requesting stream. Show explanation text. Handle denied state gracefully with fallback UI. |

---

## 12. File Structure

```
apps/web/src/
  pages/clientes/
    clientes-list-page.tsx          # List page entry (ErrorBoundary wrapper)
    clientes-detail-page.tsx        # Detail page entry (param extraction)
    clientes-shared.tsx             # Shared page shell (ClientesPageShell)
                                    #   Contains: list view, detail view, export config,
                                    #   product grouping, all tab layout orchestration

  components/clientes/
    # === Core Patient Cards ===
    patient-info-card.tsx           # Patient header card with edit dialog
    patient-medical-card.tsx        # Medical info display with edit dialog
    patient-stats.tsx               # KPI stats row (4 metric cards with stagger animation)
    patient-stats-card.tsx          # Individual patient quick stats card

    # === Timeline & History ===
    patient-timeline.tsx            # Chronological event feed with filters, procedure CRUD
    consultation-reports.tsx        # Consultation report display and generation

    # === Photo Management ===
    photo-gallery.tsx               # Photo grid/list with upload, lightbox, filter
    photo-comparison.tsx            # Before/after slider comparison

    # === Document Management ===
    document-manager.tsx            # Full document lifecycle (upload, preview, signing)
    camera-capture.tsx              # WebRTC camera for selfie + LGPDConsentStep
    clinical-terms-panel.tsx        # Clinical terminology reference panel

    # === AI Integration ===
    ai-chat-widget.tsx              # Gemini-powered clinical chat with photo analysis

    # === LGPD & Consent ===
    patient-consent-manager.tsx     # LGPD consent status, history, grant/revoke

    # === Wizard & Forms ===
    add-patient-wizard.tsx          # Multi-step patient creation wizard
    patient-form-dialog.tsx         # Standalone patient edit form dialog
    patient-advanced-search.tsx     # Advanced multi-field search dialog

    # === Financial / Gestao ===
    add-matricula-dialog.tsx        # Enrollment creation dialog
    add-pagamento-dialog.tsx        # Payment entry dialog
    parcelas-detail-sheet.tsx       # Installment detail sheet overlay
    gestao-integrations.tsx         # Asaas, Hubla, Kiwify integration panels
    product-flip-card.tsx           # 3D flip card for product display

    # === Bulk Actions ===
    delete-patient-dialog.tsx       # Single patient delete confirmation
    delete-many-patients-dialog.tsx # Bulk delete confirmation
    import-patients-dialog.tsx      # CSV/XLSX import dialog
    cliente-action-buttons.tsx      # Grouped action buttons (WhatsApp, email, etc.)

    # === External/Public ===
    remote-signing-page.tsx         # Public page for remote document signing
```

**Total: 26 component files** under `components/clientes/` + 3 page files under `pages/clientes/`.

---

## 13. Pre-Delivery Checklist

### Visual Quality

- [ ] All patient cards use `border-primary/10` ghost border, not solid `border-border`
- [ ] Avatar ring uses `ring-2 ring-primary/20` (gold at 20% opacity)
- [ ] Status badges use correct variant: `"default"` for active (gold), `"secondary"` for inactive
- [ ] Photo type badges use distinct colors from `tipoColors` map
- [ ] Timeline event dots use `eventDotColors` semantic mapping
- [ ] Empty states have centered icon (30% opacity) + descriptive text + action button
- [ ] Currency values rendered in **Fira Code** monospace font
- [ ] Medical numeric values (weight, height) rendered in **Fira Code**
- [ ] No hardcoded hex values anywhere in component files

### Interaction Quality

- [ ] All edit dialogs close on successful mutation
- [ ] All delete actions require AlertDialog confirmation
- [ ] Photo lightbox supports keyboard arrow navigation
- [ ] Wizard validates current step fields before advancing
- [ ] CEP auto-fill works and populates address fields
- [ ] Drag-and-drop upload zones have click fallback
- [ ] Camera permission requested before stream activation
- [ ] Loading buttons show spinner + descriptive text ("Salvando...", "Comprimindo...")

### Dark Mode

- [ ] Toggle light/dark and verify all sections
- [ ] Card surfaces use `bg-card` (not hardcoded white)
- [ ] Lightbox uses `bg-black/95` (not `bg-background`)
- [ ] Photo overlay gradients visible in both modes
- [ ] Badge colors maintain contrast in dark mode
- [ ] Timeline vertical line visible against dark background
- [ ] Document signing flow readable in dark mode

### Responsive

- [ ] Mobile: stats collapse to single column
- [ ] Mobile: patient list renders as cards (not table rows)
- [ ] Mobile: NeonTabs horizontally scrollable
- [ ] Mobile: dialogs expand to near full-screen
- [ ] Mobile: photo grid renders 2 columns
- [ ] Tablet: info card grid splits into 2 columns
- [ ] Desktop: tab content uses `lg:grid-cols-2` where specified

### Accessibility

- [ ] All icon-only buttons have `sr-only` labels
- [ ] All images have meaningful `alt` text
- [ ] Focus ring visible on keyboard navigation
- [ ] Dialog focus trapping works correctly
- [ ] Form errors associated with inputs via `aria-describedby`
- [ ] `prefers-reduced-motion` disables motion animations
- [ ] Document download buttons include document name in label
- [ ] Photo comparison has descriptive instruction text

### Data Safety

- [ ] PII not stored in component state beyond dialog lifecycle
- [ ] LGPD consent status checked before photo usage actions
- [ ] Document signing evidence includes all required fields
- [ ] Delete mutations guarded by confirmation dialogs
- [ ] Bulk delete shows count and requires explicit confirmation
- [ ] Upload size limits enforced client-side (5MB photos, 10MB documents)

### Code Quality

- [ ] `bunx biome check --write` passes on all edited files
- [ ] `bun run type-check` (tsgo) passes with no errors
- [ ] `bun run lint:oxlint:check` passes
- [ ] No `any` types -- all typed with proper interfaces
- [ ] No `console.log` in production code
- [ ] Mutations use `onSettled` for invalidation (not just `onSuccess`)
- [ ] No barrel imports from `lucide-react` in new components
- [ ] No `new Date()` or `new Intl.*` created in render paths

---

## 14. Success Criteria

### Measurable Outcomes

| # | Criterion | Measurement | Target |
|---|-----------|-------------|--------|
| 1 | **Page load performance** | Largest Contentful Paint (LCP) on list page | < 2.5s on 4G connection |
| 2 | **Interaction responsiveness** | Interaction to Next Paint (INP) on tab switches, dialog opens, filter changes | < 200ms |
| 3 | **Photo upload success rate** | Client-side compression + upload completes without error | > 95% success rate for images under 5MB |
| 4 | **Wizard completion rate** | Users who start the wizard and successfully submit | > 80% (measured via analytics event) |
| 5 | **LGPD compliance** | Every patient has `dados_pessoais` consent recorded; consent status visible on detail page; revocation path functional | 100% of active patients have consent record |
| 6 | **Accessibility score** | Axe/Lighthouse accessibility audit on list and detail pages | >= 95 score, 0 critical violations |
| 7 | **Dark mode parity** | All 6 detail page tabs render correctly in both light and dark modes with no contrast failures | 0 WCAG AA contrast violations in either mode |
| 8 | **Mobile usability** | All features accessible on 375px viewport (iPhone SE). No horizontal scroll. All touch targets >= 44px. | Verified on 375px, 390px, 768px viewports |
| 9 | **Document signing integrity** | Every signed document has complete `SignerEvidence` object: hash, selfie, geolocation, IP, timestamp, LGPD consent | 100% of signed documents have all evidence fields |
| 10 | **Search responsiveness** | Time from keystroke to filtered results displayed | < 500ms including debounce + API round-trip |
| 11 | **Bundle size** | `DocumentManager` (largest component) lazy-loaded; photo gallery does not load Recharts | DocumentManager chunk < 100KB gzipped |
| 12 | **Zero PII leakage** | No patient PII in browser console logs, no PII persisted in localStorage/sessionStorage | Verified via security audit |

### Definition of Done

The Clientes module is considered complete when:

1. All 14 sections of this spec are implemented and verified
2. All items in the Pre-Delivery Checklist (Section 13) are checked
3. All 12 success criteria meet their targets
4. Quality gates pass: `bun run type-check && bunx biome check && bun run lint:oxlint:check && bun run test`
5. Manual QA on staging confirms responsive behavior, dark mode, and accessibility
6. No browser console errors on list page, detail page (all 6 tabs), wizard flow, and signing flow

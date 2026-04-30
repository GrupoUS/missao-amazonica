# NeonDash Chat WhatsApp — Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** Chat WhatsApp (Messaging Interface)
**Feature Area:** Chat
**Created:** 2026-04-01
**Complexity:** L4 — multi-panel + real-time state + AI SDR + media handling

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

### Aesthetic Identity

The Chat WhatsApp interface is a **conversation-first, media-capable, AI SDR-integrated** messaging workspace. It is NOT a generic WhatsApp clone — it is a professional CRM-grade communication tool embedded within a mentorship performance dashboard.

### Design Principles

| Principle | Application |
|-----------|-------------|
| **Conversation-first** | The message thread is the focal point. Every panel exists to serve the conversation, not compete with it. |
| **Operational density** | Information-rich without clutter — contact context, CRM data, AI suggestions, and conversation history coexist in a 3-panel layout. |
| **Provider-agnostic** | The UI abstracts WhatsApp provider differences (Baileys, Meta Cloud API, Z-API). A subtle provider badge is the only indicator. |
| **AI as co-pilot** | The SDR AI sidebar provides context, suggestions, and lead temperature — never autonomous action without human confirmation. AI outputs are labeled as drafts. |
| **Real-time fluency** | Typing indicators, presence dots, read receipts, and SSE-driven message arrival create a live communication feel without polling jank. |

### Creative Direction

Following the GPUS Sovereign Architect identity: Azul Petroleo + Sovereign Gold on dark Slate 950 surfaces. The chat interface uses **tonal depth layering** (not borders) to distinguish panels. Message bubbles use the primary token for outbound messages, creating a gold-on-dark conversation thread that is unmistakably NeonDash — not a WhatsApp skin.

The interface commits to **maximum density** for desktop (3-panel simultaneous view) and **narrative focus** for mobile (single-panel-at-a-time with back navigation). There is no "comfortable medium" — each breakpoint is decisively designed for its context.

---

## 2. Colors

### Semantic Token Map

All colors reference CSS custom properties from the GPUS design system. No hardcoded hex values.

#### Message Bubbles

| Element | Light Mode | Dark Mode | Token / Class |
|---------|-----------|-----------|---------------|
| **Sent bubble bg** | `hsl(38 60% 45% / 0.1)` | `hsl(43 96% 56% / 0.1)` | `bg-primary` (solid for bubble) |
| **Sent bubble text** | `hsl(0 0% 100%)` | `hsl(222 47% 10%)` | `text-primary-foreground` |
| **Received bubble bg** | `hsl(210 40% 96%)` | `hsl(217 33% 17%)` | `bg-muted` |
| **Received bubble text** | `hsl(215 25% 40%)` | `hsl(215 20% 65%)` | `text-muted-foreground` |
| **AI message accent bg** | `hsl(38 60% 95%)` | `hsl(217 33% 17%)` | `bg-accent` with `border-primary/20` |
| **Unread badge** | `hsl(38 60% 45%)` | `hsl(43 96% 56%)` | `bg-primary text-primary-foreground` |

#### Panel Surfaces (Tonal Depth Layering)

| Surface | Light Mode | Dark Mode | Token |
|---------|-----------|-----------|-------|
| **Page background** | `#f8fafc` | `#020617` | `bg-background` |
| **Left panel (contacts)** | `#ffffff` | `#0f172a` | `bg-card` |
| **Center panel (conversation)** | `#f8fafc` with subtle overlay | `#020617` with `slate-900/30` | `bg-background` / custom |
| **Right panel (context)** | `#ffffff` | `#0f172a` | `bg-background` with `border-l border-border/50` |
| **Input area** | `hsl(0 0% 100% / 0.8)` | `hsl(222 47% 10% / 0.8)` | `bg-card/80` |
| **Conversation header** | card + blur | card + blur | `bg-card/80 backdrop-blur-sm` |

#### Status Colors

| Status | Color | Token |
|--------|-------|-------|
| **Online** | Emerald 500 | `bg-emerald-500` / `text-emerald-500` |
| **Read receipt (double blue check)** | Blue 500 | `text-blue-500` |
| **Delivered (double gray check)** | Muted foreground | `text-muted-foreground` |
| **Sent (single check)** | Muted foreground | `text-muted-foreground` |
| **Failed** | Destructive | `text-destructive` |
| **Pending** | Muted foreground | `text-muted-foreground` (Clock icon) |
| **AI SDR active** | Emerald 500 | `bg-emerald-500/10 ring-emerald-500/20` |
| **Sync error** | Destructive | `text-destructive` |
| **Sync success** | Emerald 500 | `text-emerald-500` |

#### Lead Temperature Gauge

| Temperature | Color | Class |
|-------------|-------|-------|
| Frio (Cold) | Blue 500 | `bg-blue-500 text-blue-500` |
| Morno (Warm) | Amber 500 | `bg-amber-500 text-amber-500` |
| Quente (Hot) | Orange 500 | `bg-orange-500 text-orange-500` |
| Pronto (Burning) | Emerald 500 | `bg-emerald-500 text-emerald-500` |

---

## 3. Typography

### Font Stack

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

**CRITICAL:** The font stack is `Manrope` + `Inter` + `Fira Code`. NEVER use `Fira Sans` — it is a different font family entirely. Manrope is the display/headline font (distinctive geometric humanist), Inter is the body/UI fallback, and Fira Code is for monospace contexts (timestamps, phone numbers, message IDs).

### Type Scale for Chat

| Element | Font | Weight | Size | Line Height | Tracking | Class |
|---------|------|--------|------|-------------|----------|-------|
| **Page title** | Manrope | Bold (700) | 18px | tight | tight | `font-bold text-lg tracking-tight` |
| **Contact name (list)** | Manrope | Medium (500) | 14px | normal | normal | `font-medium text-sm` |
| **Last message preview** | Inter | Regular (400) | 12px | normal | normal | `text-xs text-muted-foreground` |
| **Message body** | Inter | Regular (400) | 14px | relaxed | normal | `text-sm leading-relaxed` |
| **Message timestamp** | Fira Code | Regular (400) | 11px | normal | normal | `text-[11px] opacity-70` |
| **Phone number** | Fira Code | Regular (400) | 12px | normal | normal | `font-mono text-xs` |
| **Sender name** | Manrope | Semibold (600) | 12px | normal | normal | `font-semibold text-xs text-primary` |
| **Section label** | Inter | Medium (500) | 12px | normal | wider | `font-medium text-xs uppercase tracking-wider text-muted-foreground` |
| **SDR log timestamp** | Fira Code | Regular (400) | 10px | normal | normal | `font-mono text-[10px] text-muted-foreground/60` |
| **SDR log type badge** | Inter | Regular (400) | 9px | normal | wider | `text-[9px] uppercase` |
| **Unread count badge** | Inter | Medium (500) | 10-11px | tight | normal | `text-[10px]` or `text-[11px]` |
| **Sync feedback** | Inter | Regular (400) | 11px | normal | normal | `text-[11px]` |

### Editorial Rules (Chat-Specific)

- **Contact names** in the conversation header use `text-lg tracking-tight` for authority.
- **Timestamps** always use Fira Code monospace for consistent digit alignment.
- **Message content** uses `whitespace-pre-wrap break-words` to preserve user formatting.
- **All-caps section labels** (`tracking-wider`) for architectural separation in the right panel (Recado, Midia links e docs, etc.).
- **Scale contrast**: Page header `text-lg` vs message body `text-sm` provides a clear 1.3x ratio appropriate for a workspace UI (not a marketing page).

---

## 4. Layout Architecture

### 3-Panel Desktop Layout (>= 1024px)

```
+-----------------------------------------------------------------------+
|  ChatPageHeader (full width, sticky)                                   |
|  [MessageCircle] Chat  |  [conversationCount] conversas               |
|  [sync status]         |  [SDR toggle] [Bot icon] [Sync] [Settings]  |
+-----------------------------------------------------------------------+
|           |                                    |                       |
|  LEFT     |  CENTER                            |  RIGHT               |
|  PANEL    |  PANEL                             |  PANEL               |
|  (320px)  |  (flex-grow, min-w-0)              |  (320px, collapsible)|
|           |                                    |                       |
|  +------+ | +--------------------------------+ | +-------------------+ |
|  |Search| | | ConversationHeader             | | | [X] Detalhes      | |
|  +------+ | | [Avatar] Name  [...actions]    | | | [Contato|SDR|     | |
|  |      | | +--------------------------------+ | |  CRM|Agenda]      | |
|  |Conver| | |                                | | |                   | |
|  |sation| | |  VirtualizedMessageList        | | | Contact profile   | |
|  |Item  | | |  (react-virtuoso)              | | | or SDR config     | |
|  |------| | |                                | | | or CRM data       | |
|  |Conver| | |  [DateSeparator]               | | | or Agenda         | |
|  |sation| | |  [MessageBubble] <-- received  | | |                   | |
|  |Item  | | |       [MessageBubble] --> sent  | | |                   | |
|  |------| | |  [DateSeparator]               | | |                   | |
|  |Conver| | |  [MessageBubble]               | | |                   | |
|  |sation| | |                                | | |                   | |
|  |Item  | | |  [TypingIndicator]             | | |                   | |
|  |      | | +--------------------------------+ | |                   | |
|  |      | | | MessageInput                   | | |                   | |
|  |      | | | [Emoji][Attach] [TextArea] [Mic/Send] | |             | |
|  +------+ | +--------------------------------+ | +-------------------+ |
+-----------------------------------------------------------------------+
```

### Implementation: ResizablePanelGroup

The layout uses `ResizablePanelGroup` (from `@/components/ui/resizable`) for the desktop view, allowing users to resize the left and right panels:

```
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={22} minSize={18} maxSize={30}>
    <!-- Left: ConversationSidebar -->
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={56}>
    <!-- Center: Conversation view -->
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={22} minSize={0} maxSize={30}>
    <!-- Right: RightPanel (collapsible) -->
  </ResizablePanel>
</ResizablePanelGroup>
```

### Key Layout Rules

| Rule | Detail |
|------|--------|
| **Single scroll context** | The message list uses `react-virtuoso` (`Virtuoso` component) for windowed rendering. It is NOT wrapped in a `ScrollArea`. The left panel contacts list and right panel content each have their own scroll contexts. |
| **Conversation area bg** | Uses `bg-slate-900/30` overlay on `bg-background` for subtle depth differentiation from the side panels. |
| **Panel borders** | `border-border/50` (50% opacity) for panel dividers — following the "ghost border" approach from Stitch design system. |
| **Header stacking** | `ChatPageHeader` sits above the 3-panel layout. Within the center panel, `ChatConversationHeader` is fixed at top with `bg-card/80 backdrop-blur-sm`. |
| **Input area** | Fixed at the bottom of the center panel, `bg-card/80`, `border-t border-border/50`. Min height 56px, grows up to 4 lines of text (max-h-120px). |
| **Right panel collapse** | When collapsed, the center panel takes full remaining width. Toggle via header button or conversation header action. |

### Viewport Height

The chat page uses `h-[calc(100vh-4rem)]` to account for the dashboard layout's top navigation bar (64px / 4rem).

---

## 5. Component Inventory

### shadcn/ui Components Used

| Component | Import Path | Usage |
|-----------|-------------|-------|
| `Button` | `@/components/ui/button` | Send, attach, emoji, close, action icons |
| `Input` | `@/components/ui/input` | Search, contact edit, SDR config fields |
| `Textarea` | `@/components/ui/textarea` | Message input, contact notes |
| `Avatar` / `AvatarImage` / `AvatarFallback` | `@/components/ui/avatar` | Contact avatars, sender avatars |
| `Badge` | `@/components/ui/badge` | Unread count, provider badges, log type labels |
| `ScrollArea` | `@/components/ui/scroll-area` | Left panel contacts list, right panel content, SDR sidebar tabs (NOT message list) |
| `Dialog` / `DialogContent` / etc. | `@/components/ui/dialog` | Edit contact, link CRM, media lightbox |
| `Sheet` / `SheetContent` | `@/components/ui/sheet` | Legacy contact info panel (mobile) |
| `DropdownMenu` / `DropdownMenuContent` | `@/components/ui/dropdown-menu` | Message context menu (reply, react, copy, delete) |
| `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | `@/components/ui/tabs` | Right panel tabs (Contato, SDR, CRM, Agenda), SDR sidebar tabs |
| `Select` / `SelectContent` / `SelectItem` | `@/components/ui/select` | Lead linking, connection selector |
| `Card` / `CardContent` / `CardHeader` | `@/components/ui/card` | SDR lead context card |
| `Switch` | `@/components/ui/switch` | Notifications toggle, AI handoff toggle |
| `Separator` | `@/components/ui/separator` | Section dividers in right panel |
| `Tooltip` / `TooltipContent` / `TooltipTrigger` | `@/components/ui/tooltip` | Disabled action tooltips |
| `Label` | `@/components/ui/label` | Form field labels |
| `ResizablePanel` / `ResizablePanelGroup` / `ResizableHandle` | `@/components/ui/resizable` | Desktop 3-panel layout |

### External Libraries

| Library | Version Constraint | Usage |
|---------|-------------------|-------|
| `react-virtuoso` | Current | `Virtuoso` component for windowed message list rendering. Handles 10,000+ messages without DOM bloat. |
| `motion/react` | Current | `LazyMotion`, `domAnimation`, `m`, `AnimatePresence` for typing indicator, SDR sidebar entrance, log item stagger. NEVER use `framer-motion` — the project uses the renamed `motion/react` package. |
| `lucide-react` | Current | All icons. Import from individual icon paths for tree-shaking. |
| `sonner` | Current | Toast notifications for send success/failure, sync status, AI toggle. |

---

## 6. Detailed Sections

### 6a. Contacts List Panel (Left Panel)

**Component:** `ConversationSidebar` (composed from `ConversationItem` components)

**Structure:**
- **Search bar** at top: `Input` with `Search` icon prefix, debounced at 300ms (`useDebouncedValue`).
- **Connection selector** (Baileys only): Dropdown showing available sessions with connection status indicators. Appears above the conversation list when multiple Baileys sessions exist.
- **Conversation list**: `ScrollArea` wrapping a list of `ConversationItem` components.

**ConversationItem data shape:**
```typescript
interface ConversationItemData {
  phone: string;
  name: string | null;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | string | null;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  aiMode: "ai" | "human";
}
```

**Visual elements per item:**
- `ContactAvatar` (40x40px) with online indicator dot (emerald).
- Contact name (truncated, `font-medium text-sm`).
- Last message preview (truncated single line, `text-xs text-muted-foreground`).
- Timestamp of last message (right-aligned, `text-[11px]`).
- Unread count badge (`bg-primary`, min-w-5, rounded-full).
- AI mode indicator: small bot icon if AI-managed.
- Typing indicator: replaces last message with "digitando..." when contact is typing.

**Interaction:**
- Click selects conversation (sets `selectedPhone`).
- Selected conversation highlighted with `bg-accent/50`.
- Hover state: `hover:bg-accent/50` transition.

**Loading state:** `ConversationSkeleton` components (3-5 skeleton rows with avatar + text placeholders).

**Empty state:** Icon + "Nenhuma conversa" message with description text.

### 6b. Conversation Header (Center Panel Top)

**Component:** `ChatConversationHeader`

**Layout:** Horizontal bar with:
- **Back button** (mobile only): `ArrowLeft` icon, returns to contact list.
- **Contact avatar** (32x32px) with online dot.
- **Contact info**: Name (`font-semibold text-base`), status text ("Online" or "digitando..." or phone number).
- **Action buttons** (right-aligned):
  - Search messages toggle (`Search` icon).
  - Video message composer toggle (`Video` icon).
  - AI/Human handoff toggle (`HandoffToggle` component) — shows current mode with Bot/User icon.
  - Edit contact (`Pencil` icon, opens dialog).
  - Toggle right panel (`PanelRight` icon).

**Message search bar:** Conditional `Input` that slides in below the header when search is toggled. Filters messages client-side by content match.

### 6c. Virtualized Message List (Center Panel Body)

**Component:** `VirtualizedMessageList` wrapping `react-virtuoso` `Virtuoso`

**CRITICAL: This component uses windowed virtualization, NOT a ScrollArea.** The `Virtuoso` component only renders messages visible in the viewport plus an overscan buffer, enabling smooth scrolling through 10,000+ messages without memory or DOM bloat.

**Configuration:**
```typescript
<Virtuoso
  alignToBottom           // Messages anchored to bottom
  followOutput="smooth"   // Auto-scroll on new messages (when at bottom)
  increaseViewportBy={48} // Expand render window
  overscan={120}          // Pixels of overscan above/below viewport
  startReached={handleStartReached}  // Trigger load-more on scroll to top
  atBottomStateChange={atBottomStateChange}  // Track scroll position
/>
```

**Item types (discriminated union):**
```typescript
type RenderItem =
  | { type: "message"; key: string; message: MessageBubbleData }
  | { type: "date"; key: string; date: Date | string };
```

**Date separators:** Inserted between messages from different days. Shows formatted date string centered with horizontal lines.

**Loading states:**
- Initial load: Centered spinner with "Carregando mensagens..." text.
- Load more (scroll to top): Spinner at top of list via `isLoadingMore` prop.
- Empty state: "Nenhuma mensagem ainda" with "Envie uma mensagem para comecar" subtext.

**Footer:** Typing indicator renders in the Virtuoso footer slot, appearing below the last message.

**Scroll-to-bottom:** `followOutput="smooth"` handles auto-scroll when user is at the bottom. A floating "scroll to bottom" button (`ChevronDown` icon) appears when user scrolls up (`!atBottom` state).

### 6d. Message Bubble Variants

**Component:** `MessageBubble` (memoized with custom `arePropsEqual` comparator)

**Base structure:**
```
<article aria-label="Mensagem {direction} as {time}">
  [Avatar (received only, optional)]
  <div class="bubble">
    [Sender name (received only)]
    [Quote block (if reply)]
    [MediaPreview (if media attached)]
    [MessageContent (text with linkified URLs)]
    [Reactions row]
    [Timestamp + Status icon]
  </div>
  [Context menu trigger (MoreHorizontal icon, visible on hover)]
</article>
```

**Direction-based styling:**

| Property | Outbound (sent) | Inbound (received) |
|----------|-----------------|---------------------|
| Alignment | `justify-end` | `justify-start` |
| Background | `bg-primary` | `bg-muted` |
| Text color | `text-primary-foreground` | `text-muted-foreground` |
| Border radius | `rounded-2xl rounded-br-sm` | `rounded-2xl rounded-bl-sm` |
| Border | None | `border border-border` |
| Max width | `max-w-[70%]` | `max-w-[70%]` |

**Media variants:**

| Type | Rendering |
|------|-----------|
| **Image** | Thumbnail with aspect ratio preservation, click-to-lightbox (`ImageLightbox` dialog), download button. Max height: 144px (compact) / 256px (full). |
| **Video** | HTML5 `<video>` with controls and `preload="metadata"`. Captions track for accessibility. Max height: 160px (compact) / 224px (full). |
| **Audio** | HTML5 `<audio>` with controls. Duration and size metadata displayed. |
| **Document/File** | File icon + filename + metadata (mime type, size). Download link. |

**Quote block:** Left-bordered (`border-l-2 border-current/30`) with `bg-black/15`, showing sender name and truncated quoted content.

**Reactions:** Row of emoji buttons with count badges. User's own reactions highlighted with `border-primary/50 bg-primary/20`.

**Context menu actions:** Reply, React (emoji picker), Copy, Delete (destructive variant).

**AI message indicator:** Messages with `isFromAi === "sim"` should display a subtle AI badge (Bot icon) or different accent border to distinguish AI-generated responses from human messages.

### 6e. Typing Indicator

**Component:** `TypingIndicator`

**Animation:** Three dots bouncing in sequence using `motion/react`:
- Each dot: `h-2 w-2 rounded-full bg-slate-400`.
- Y-axis bounce: `[0, -4, 0]` with opacity pulse `[0.4, 1, 0.4]`.
- Duration: 0.6s per cycle, infinite repeat.
- Stagger: 0.15s delay between dots.

**Bubble style:** `rounded-2xl rounded-bl-sm bg-slate-800 dark:bg-slate-700/80 border border-slate-700/50`.

**Auto-hide:** Configurable timeout (default 4500ms). Uses `lastActivityAt` timestamp to calculate remaining time. Calls `onTimeout` callback when expired.

**Layout:** Renders in the Virtuoso footer slot, aligned to `justify-start` (inbound position).

**Accessibility:** `aria-live="polite"` + `role="status"` + descriptive `aria-label`.

### 6f. Message Input

**Component:** `MessageInput`

**Layout:** Horizontal bar at bottom of center panel:
```
[EmojiPicker] [Attach] [  Textarea (auto-growing)  ] [Mic | Send]
```

**Textarea behavior:**
- Auto-expands from 1 to 4 rows based on content (min-h-40px, max-h-120px).
- `resize-none` to prevent manual resize.
- Enter sends message, Shift+Enter adds newline.
- Typing indicator emission: debounced at 3000ms, emits `isTyping: true` on text input, `false` on stop or send.

**Button states:**
- **Mic button** (no text): Shown when textarea is empty and features are enabled. Ghost variant.
- **Send button** (has text): `bg-emerald-500 text-white hover:bg-emerald-600`. Appears when textarea has content.
- **Attach button**: Opens hidden file input accepting `image/*, video/*, audio/*, .pdf, .doc, .docx, .xls, .xlsx, .txt`. Multiple file selection enabled.
- **Emoji picker**: Custom `EmojiPicker` component, positioned first in the row.

**Disabled state:** All interactive elements disable when `disabled` prop is true. Send button also requires non-empty trimmed text.

### 6g. SDR AI Sidebar

**Component:** `SdrSidebar` (legacy) / `SdrConfigTab` (current, in right panel)

The SDR functionality is integrated into the Right Panel as the "SDR" tab, not as a separate sidebar anymore. However, the legacy `SdrSidebar` component still exists as a slide-in overlay.

**SDR Config Tab contents:**
- Agent status indicator (active/paused with emerald dot).
- Lead Temperature Gauge (animated bar: cold/warm/hot/burning).
- Lead Context Card: Auto-extracted fields (Name, Interest, Budget, Pain Summary). Each field editable with refresh button.
- AI Suggestion block: `border-indigo-500/20 bg-indigo-500/5` card with Brain icon. Contains suggestion text labeled as AI-generated.
- Activity Log: Timeline of agent thoughts/actions/info/errors, each with colored dot, timestamp (Fira Code), type badge, and content text. Staggered entrance animation (80ms delay per item).

**Log type visual system:**

| Type | Dot Color | Badge Color | Background |
|------|-----------|-------------|------------|
| thought | indigo-500 | indigo-400 | indigo-500/10 |
| action | emerald-500 | emerald-400 | emerald-500/10 |
| info | muted-foreground | border text-muted-foreground | muted/30 |
| error | red-500 | red-400 | red-500/10 |

**AI suggestion pattern (GPUS AI Interface):**
- Output labeled as draft/suggestion — never presented as authoritative.
- Shaped skeleton loaders when waiting for AI analysis (paragraph-shaped for text, list-shaped for bullet points).
- Progress labels during generation: "Analisando conversa..." -> "Identificando intencao..." -> "Gerando sugestao...".

### 6h. Contact Info Panel (Right Panel — Contato Tab)

**Component:** `RightPanel` with `ContactTabContent`

**4-tab structure:** `Contato | SDR | CRM | Agenda`

**Contato tab layout:**
1. **Profile section**: Large avatar (96x96px, `ring-4 ring-background shadow-xl`), name, phone, online status badge.
2. **Quick actions**: Phone (disabled), Video (disabled), Search messages — each as `ActionIcon` with `rounded-xl bg-background shadow-sm` buttons.
3. **About/Bio**: "Recado" section in bordered card.
4. **Media gallery**: 3-column grid of media thumbnails (placeholder state).
5. **Settings**: Notifications (toggle), Favorited messages, Edit contact, Temporary messages.
6. **Danger zone**: Block contact, Delete conversation — `text-destructive hover:bg-destructive/10`.

**CRM tab:** Shows linked lead data, allows CRM operations.
**Agenda tab:** Shows appointments and scheduling for the contact.

### 6i. Media Preview Overlay

**Component:** `ImageLightbox` (inside `MediaPreview`)

**Implementation:** Uses shadcn `Dialog` component:
- `max-w-4xl` fullscreen-like overlay.
- `bg-black/95` backdrop with `border-none`.
- Image rendered with `max-h-[90vh] max-w-full object-contain`.
- Close button: top-right, ghost variant, white text.
- Download button: bottom-right, secondary variant with `Download` icon.
- `DialogTitle` with `sr-only` class for accessibility.

### 6j. WhatsApp Provider Indicator

**Dual-provider architecture:** The codebase supports three WhatsApp providers:
1. **Baileys** — Local WebSocket session (primary, self-hosted).
2. **Meta Cloud API** — Official WhatsApp Business API.
3. **Z-API** — Third-party API proxy (legacy).

**Provider detection:** `useWhatsAppProvider()` hook returns `activeProvider` ("baileys" | "meta" | "zapi"), `isConnected`, and per-provider status objects.

**UI indicators:**
- Connection status in `ChatPageHeader`: Provider name + connection state.
- `ConnectionSelector` dropdown for Baileys multi-session: Shows session list with display names and connection status.
- Per-provider sync behavior: Baileys and Z-API have explicit sync mutations; Meta uses query-based fetching.

**CRITICAL:** The UI must never hardcode provider-specific logic in rendering components. All provider abstraction happens in hooks (`useWhatsAppConversations`, `useWhatsAppMessages`, `useWhatsAppSendMessage`), and the UI consumes a unified interface.

---

## 7. Animations

### Motion Library

All animations use `motion/react` (the renamed Motion library). NEVER import from `framer-motion`.

```typescript
import { AnimatePresence, domAnimation, LazyMotion, m } from "motion/react";
```

`LazyMotion` with `domAnimation` features is used to minimize bundle size.

### Animation Inventory

| Animation | Duration | Easing | Properties | Component |
|-----------|----------|--------|------------|-----------|
| **Message send** | 200ms | `easeOut` | `opacity: 0->1, x: 8->0` | `MessageBubble` (new outbound) |
| **Typing indicator dots** | 600ms | `easeInOut` | `y: [0, -4, 0], opacity: [0.4, 1, 0.4]` | `TypingIndicator` |
| **Typing indicator entrance** | 200ms | spring | `opacity: 0->1, y: 10->0` | `TypingIndicator` container |
| **SDR sidebar slide** | 300ms | spring (stiffness: 300, damping: 30) | `x: 100%->0, opacity: 0->1` | `SdrSidebar` |
| **Activity log stagger** | 80ms delay per item | default | `opacity: 0->1, x: -8->0` | SDR log entries |
| **Lead temperature bar** | 800ms | `easeOut` | `width: 0->100%` | `LeadTemperatureGauge` |
| **Empty state entrance** | 200ms | default | `opacity: 0->1, y: 8->0` | Empty conversation state |
| **Scroll-to-bottom button** | 200ms | CSS transition | `opacity, transform` | Floating button |
| **Media skeleton shimmer** | infinite | CSS keyframe | `background-position` shift | Skeleton loader |

### Animation Rules

1. **GPU-accelerated only**: All animations use `transform` and `opacity`. No `width`, `height`, `margin`, or `padding` animations except the temperature gauge bar (which uses `width` inside a contained overflow element).
2. **`prefers-reduced-motion` is MANDATORY**: All `motion/react` animations must be wrapped or conditionally disabled. Use the `motion-reduce:` Tailwind variant for CSS transitions.
3. **One orchestrated entrance per panel**: When a panel opens (SDR sidebar, right panel), use a single spring animation. Individual content elements within can stagger, but total sequence must not exceed 800ms.
4. **CSS-only hover states**: All hover effects (message bubble hover, button hover, contact item hover) use CSS `transition-colors` / `transition-opacity`. No JS-driven hover animations.

---

## 8. Responsive Behavior

### Breakpoint Strategy

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| **< 640px (mobile)** | Single panel | One panel visible at a time. Back button navigates between panels. Contact list is default view. |
| **640px - 1023px (tablet)** | Dual panel | Left panel (contacts) + Center panel (conversation). Right panel opens as overlay. |
| **>= 1024px (desktop)** | Triple panel | All three panels visible. Right panel collapsible via `ResizablePanel`. |

### Mobile Layout (<640px / `sm:hidden`)

**Implementation:** Conditional rendering with `className` toggling:

```
Panel visibility controlled by:
- No phone selected: Left panel visible, center hidden
- Phone selected: Center panel visible, left hidden
- Right panel: Always overlay (Sheet) on mobile
```

**Navigation:**
- Selecting a conversation hides the contact list and shows the conversation.
- Back button (`ArrowLeft`) in conversation header returns to contact list.
- Right panel opens as a full-screen `Sheet` slide-in.

**Touch targets:** All interactive elements meet minimum 44x44px touch targets (WCAG 2.2 SC 2.5.8). Danger zone buttons use `min-h-[44px]` / `min-h-[48px]`.

### Desktop Layout (>= 640px / `hidden sm:flex`)

**Implementation:** `ResizablePanelGroup` with three panels:
- Left: `defaultSize={22}`, `minSize={18}`, `maxSize={30}`.
- Center: `defaultSize={56}` (takes remaining space).
- Right: Conditionally rendered, `defaultSize={22}`, collapsible to 0.

### Key Responsive Rules

1. **No 3-panel split below 1024px.** The three-panel layout is only for desktop.
2. **Message input always at bottom** regardless of viewport size.
3. **Avatar sizes scale**: 40px in contact list, 32px in message bubbles, 96px in contact info, 128px in Sheet contact info.
4. **Thumb zone compliance**: On mobile, primary actions (send, back, select conversation) are positioned in the bottom 2/3 of the screen.

---

## 9. State Management

### State Architecture Overview

| State Category | Location | Mechanism |
|----------------|----------|-----------|
| **Server state (conversations)** | tRPC query cache | `useWhatsAppConversations()` hook, manual refetch via SSE triggers |
| **Server state (messages)** | tRPC query cache | `useWhatsAppMessages()` hook, manual refetch on SSE events |
| **Selected conversation** | `useState<string \| null>` | `selectedPhone` — URL also tracks via `?phone=` search param |
| **Message input** | `useState<string>` | `message` — local, resets on send |
| **Typing state (remote)** | `useState<TypingState>` | `typingByPhone` — updated via SSE `typing-start`/`typing-stop` events |
| **Presence state** | `useState<PresenceState>` | `presenceByPhone` — updated via SSE `contact-online`/`contact-offline` events |
| **Message overrides** | `useState<Record<number, Partial<WhatsAppMessage>>>` | `messageOverrides` — optimistic updates for reactions, read receipts |
| **Conversation AI modes** | `useState<Record<string, "ai" \| "human">>` | `conversationModes` — optimistic + persisted via `setConversationMode` mutation |
| **Panel visibility** | `useState<boolean>` | `isRightPanelOpen`, `isMessageSearchOpen`, `editContactOpen` |
| **Right panel tab** | `useState<RightPanelTab>` | `rightPanelTab` — "contato" | "sdr" | "crm" | "agenda" |
| **Sync lifecycle** | `useState<SyncLifecycle>` | `syncLifecycle` — tracks sync state, last success, error message |
| **Scroll position** | `useState<boolean>` | `atBottom` — controls scroll-to-bottom button visibility |
| **AI config** | tRPC query | `trpc.aiAgent.getConfig.useQuery({ agentType: "sdr" })` |

### Real-Time Data Flow

**SSE (Server-Sent Events)** via `useSSE` hook:

```
Server SSE Stream -> useSSE hook -> Event callbacks:
  onTypingStart   -> setTypingByPhone (add typing state)
  onTypingStop    -> setTypingByPhone (remove typing state)
  onContactOnline -> setPresenceByPhone (set true)
  onContactOffline-> setPresenceByPhone (set false)
  onReaction      -> setMessageOverrides (add/remove reaction)
  new-message     -> scheduleMessagesRefetch + scheduleConversationsRefetch
  message-read    -> setMessageOverrides (update status)
```

**Refetch strategy (NOT polling):**

The chat page uses a **manual refetch with debouncing and throttling** pattern rather than `refetchInterval`:

```typescript
// Debounce: 220ms between refetch triggers
const REFETCH_DEBOUNCE_MS = 220;
// Throttle: Minimum 700ms between actual refetch executions
const REFETCH_MIN_GAP_MS = 700;
// Auto-sync: Full conversation sync every 60 seconds
const AUTO_SYNC_INTERVAL_MS = 60_000;
```

SSE events trigger refetches via `scheduleConversationsRefetch()` and `scheduleMessagesRefetch()`. These functions implement:
1. **Debouncing** — Coalesces rapid-fire events into a single refetch.
2. **Throttling** — Prevents refetches more frequent than 700ms apart.
3. **In-flight deduplication** — If a refetch is already running, queues one more after completion (not N more).

**IMPORTANT:** When using `refetchInterval` on any query in this feature, `staleTime` MUST equal `refetchInterval`. Currently, the chat page opts for manual refetch over interval-based polling.

### Optimistic Updates

| Mutation | Optimistic Strategy |
|----------|---------------------|
| **Send message** | Not optimistic — relies on post-send refetch via callback. |
| **Toggle conversation AI mode** | Optimistic local state update + backend persist. Rollback on mutation error. |
| **AI config toggle** | Optimistic cache update via `setData` + invalidation on success. |
| **Mark as read** | Fire-and-forget mutations per unread inbound message. Tracked via `markedMessageIdsRef` Set to prevent duplicates. |
| **Reactions (via SSE)** | Applied immediately to `messageOverrides` state from SSE payload. |

### tRPC Mutation Rules

- All `mutateAsync` calls MUST be wrapped in try-catch with user-facing toast on error (Stability Rule J).
- All mutations use `onSettled` or explicit `invalidate()` for cache sync — never trust optimistic state as ground truth.
- The send mutation uses a success callback to clear input and trigger refetch.

---

## 10. Accessibility

### ARIA Patterns

| Element | ARIA Attributes | Notes |
|---------|-----------------|-------|
| **Message list** | Container: implicit via Virtuoso | Virtuoso handles list semantics. |
| **Individual message** | `<article aria-label="Mensagem {enviada\|recebida} as {time}">` | Each bubble is a semantic article with descriptive label. |
| **Typing indicator** | `aria-live="polite"` + `role="status"` + `aria-label="{name} esta digitando..."` | Announced by screen readers when visible. |
| **Sync status** | `aria-live="polite"` (status) / `role="alert"` (error) | Sync errors announced immediately; status updates politely. |
| **Send button** | `aria-label="Enviar mensagem"` | Icon-only button with label. |
| **Attach button** | `aria-label="Anexar arquivo"` | Icon-only button with label. |
| **Audio button** | `aria-label="Gravar audio"` | Icon-only button with label. |
| **Close panel button** | `aria-label="Fechar painel"` | Icon-only button with label. |
| **Media images** | `alt={filename}` on `<img>`, `aria-label` on lightbox button | Descriptive alt text from filename or type. |
| **Hidden file input** | `aria-hidden="true"` + `tabIndex={-1}` | Programmatically triggered, not keyboard-navigable. |
| **Video/Audio elements** | `<track default kind="captions" label="Portugues" />` | Caption tracks required for all media. |
| **Emoji picker** | Keyboard-navigable grid | Arrow keys for navigation, Enter to select. |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| **Enter** | Send message (when textarea focused) |
| **Shift+Enter** | New line in textarea |
| **Escape** | Close dialog/sheet/dropdown |
| **Tab** | Navigate between interactive elements |
| **Arrow keys** | Navigate emoji picker grid |

### Focus Management

- When selecting a conversation, focus moves to the message textarea.
- When opening a dialog, focus traps inside the dialog (handled by Radix UI primitives).
- When closing right panel, focus returns to the trigger button.
- Message context menu (`DropdownMenu`) manages focus trap automatically.

### WCAG 2.2 Compliance

| SC | Requirement | Implementation |
|----|-------------|----------------|
| 2.4.11 | Focus not obscured | Fixed headers do not cover focused elements; Virtuoso handles scroll-into-view. |
| 2.5.7 | Dragging (resize panels) | `ResizableHandle` can be operated via keyboard. |
| 2.5.8 | Touch targets | All buttons >= 44x44px. Danger zone items: `min-h-[44px]` / `min-h-[48px]`. Action icons: `h-10 w-10`. |
| 3.3.7 | Redundant entry | Edit contact dialog pre-fills existing values. |

### Color Contrast

All text/background combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text):
- `text-foreground` on `bg-background`: Petroleo on Slate 50 (light) / Slate 50 on Slate 950 (dark).
- `text-primary-foreground` on `bg-primary`: White on Gold (light) / Dark on Amber (dark).
- `text-muted-foreground` on `bg-muted`: Verified via GPUS design system.

---

## 11. Anti-Patterns

### FORBIDDEN Practices

| # | Anti-Pattern | Why Forbidden | Correct Approach |
|---|-------------|---------------|------------------|
| 1 | **Loading all messages into JS memory** | O(n) memory consumption. 10,000+ messages = browser crash. Aggregation must happen at SQL layer. | Use `react-virtuoso` `Virtuoso` for windowed rendering. Only visible messages + overscan buffer exist in DOM. Load-more on scroll-to-top. |
| 2 | **Using ScrollArea for message list** | ScrollArea renders all children in DOM. With 10,000+ messages this causes massive DOM bloat, layout thrashing, and CLS. | `Virtuoso` component with `alignToBottom`, `followOutput`, and `startReached` for infinite scroll. |
| 3 | **Importing from `framer-motion`** | The project uses the renamed `motion/react` package. `framer-motion` is a different (legacy) import path that will either fail to resolve or bundle duplicate code. | `import { m, AnimatePresence, LazyMotion, domAnimation } from "motion/react"` |
| 4 | **Hardcoded WhatsApp provider** | The codebase supports 3 providers (Baileys, Meta, Z-API). Hardcoding provider-specific API calls in UI components breaks when switching providers. | Use `useWhatsAppConversations`, `useWhatsAppMessages`, `useWhatsAppSendMessage` hooks that abstract provider differences. |
| 5 | **Multiple ScrollArea nesting** | Nesting ScrollArea components causes conflicting scroll contexts, scroll-jacking, and broken touch scrolling on mobile. | One scroll context per panel: ScrollArea for contacts list, Virtuoso for messages, native overflow-y-auto for right panel content. |
| 6 | **`refetchInterval` without matching `staleTime`** | If `staleTime < refetchInterval`, TanStack Query shows stale data between refetches, causing UI flicker. If `staleTime > refetchInterval`, refetches are wasted. | `staleTime` MUST equal `refetchInterval`. Currently, the chat page uses manual refetch instead of intervals, but any future polling queries must follow this rule. |
| 7 | **JS-driven hover animations** | `mouseenter`/`mouseleave` handlers for animation state kill INP scores. Each hover triggers a JS event, state update, and re-render. | CSS `transition-colors`, `transition-opacity` on hover pseudo-class. All hover effects in the chat are CSS-only. |
| 8 | **Hardcoded hex colors** | Violates GPUS design system. Makes dark mode impossible. Breaks consistency across the application. | Semantic tokens only: `bg-primary`, `text-foreground`, `border-border`, `bg-muted`. Never `bg-[#0f4c75]`. |
| 9 | **`console.log` in production** | Noise in production logs. Exposes internal state to browser devtools. | Use pino logger from `_core/logger` for server. Remove all `console.log` before merge. |
| 10 | **Creating `new Date()` in render path** | Creates a new object on every render, defeating memoization and causing unnecessary re-renders in memoized children. | Hoist date formatting to module-level functions. Use `useMemo` for computed date values. The `formatTime` function in `MessageBubble` is correctly defined outside the component. |
| 11 | **`barrel imports from lucide-react`** | `import { Check } from "lucide-react"` loads the entire icon library. | Import from individual paths: `import Check from "lucide-react/dist/esm/icons/check"`. (Note: current codebase uses barrel imports — this is a known optimization target.) |
| 12 | **Mutating arrays with `.sort()`** | `.sort()` mutates in place, breaking React's immutability contract and causing subtle bugs with memoized components. | Use `.toSorted()` (immutable). The codebase correctly uses `.toSorted()` for message ordering. |

---

## 12. File Structure

### Component Tree

```
apps/web/src/
├── pages/
│   ├── chat-page.tsx                    # Main orchestrator (state, SSE, mutations)
│   └── chat/
│       └── chat-page-components.tsx     # Extracted sub-components (header, sidebar, input area, etc.)
├── components/
│   └── chat/
│       ├── agenda-tab.tsx               # Right panel: Agenda tab content
│       ├── chat-message-bubble.tsx       # Alternate/legacy bubble (check usage)
│       ├── contact-avatar.tsx           # Shared avatar with fallback initials
│       ├── contact-info-panel.tsx       # Legacy Sheet-based contact panel
│       ├── contacts-list-panel.tsx      # Standalone contacts management panel
│       ├── conversation-item.tsx        # Single conversation row in sidebar
│       ├── conversation-skeleton.tsx    # Loading skeleton for conversation list
│       ├── crm-tab.tsx                  # Right panel: CRM tab content
│       ├── date-separator.tsx           # Date divider between message groups
│       ├── emoji-picker.tsx             # Emoji selection popover
│       ├── handoff-toggle.tsx           # AI/Human mode toggle button
│       ├── lead-chat-window.tsx         # Embedded chat for lead detail page
│       ├── media-preview.tsx            # Media rendering (image, video, audio, file)
│       ├── message-bubble.tsx           # Core message bubble (memoized)
│       ├── message-input.tsx            # Text input with emoji, attach, send
│       ├── message-skeleton.tsx         # Loading skeleton for messages
│       ├── right-panel.tsx              # 4-tab collapsible panel (Contato, SDR, CRM, Agenda)
│       ├── sdr-config-tab.tsx           # Right panel: SDR configuration tab
│       ├── sdr-sidebar.tsx              # Legacy SDR sidebar (overlay)
│       ├── typing-indicator.tsx         # Animated typing dots
│       ├── video-message-composer.tsx   # Video message recording/upload
│       └── virtualized-message-list.tsx # react-virtuoso wrapper
├── hooks/
│   ├── use-s-s-e.ts                    # SSE connection and event subscription
│   ├── use-whats-app-cache-sync.ts     # Cache synchronization
│   ├── use-whats-app-provider.ts       # Multi-provider abstraction
│   ├── use-whats-app-conversations.ts  # (within use-whats-app-provider)
│   ├── use-whats-app-messages.ts       # (within use-whats-app-provider)
│   ├── use-whats-app-send-message.ts   # (within use-whats-app-provider)
│   └── use-debounced-value.ts          # Generic debounce hook
├── routes/
│   └── _dashboard.chat.tsx             # TanStack Router route (lazy-loaded)
└── lib/
    ├── linkify.ts                       # URL detection in message content
    └── utils.ts                         # cn() and shared utilities
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **`chat-page.tsx` is the state orchestrator** | All state lives here; sub-components are stateless/presentational where possible. This prevents prop-drilling depth > 2 and keeps state colocated with its mutation logic. |
| **`chat-page-components.tsx` extracted** | The main page file was exceeding 200 lines of JSX. Sub-components (header, sidebar, input area, empty states) were extracted to a co-located file for readability without introducing new directories. |
| **`right-panel.tsx` replaces `contact-info-panel.tsx` + `sdr-sidebar.tsx`** | Consolidated 3 separate panels into a single 4-tab component. Reduces panel management complexity and provides a consistent right-side context panel. |
| **Route lazy-loading** | Chat page is loaded via `React.lazy` in the route file to avoid bloating the initial bundle. The chat feature is behind auth and not on the critical path. |
| **Hooks abstract provider** | `useWhatsAppProvider` family of hooks encapsulate the 3-provider switching logic, so the UI never branches on provider type. |

---

## 13. Pre-Delivery Checklist

### Visual Quality

- [ ] Message bubbles render correctly for both sent (gold bg) and received (muted bg) in light and dark mode.
- [ ] Conversation list items show avatar, name, last message, timestamp, and unread badge.
- [ ] Right panel tabs (Contato, SDR, CRM, Agenda) all render content without overflow issues.
- [ ] Media previews (image, video, audio, file) render within max-height constraints.
- [ ] Image lightbox opens, displays full image, and has working download button.
- [ ] Typing indicator dots animate smoothly with correct stagger.
- [ ] Lead temperature gauge animates from 0 to target width on render.
- [ ] Empty states display centered with appropriate icon and text.
- [ ] Date separators appear between messages from different days.
- [ ] Provider connection status displays correctly in header.

### Interaction

- [ ] Send message: Enter key sends, Shift+Enter adds newline.
- [ ] Send button appears only when textarea has content; Mic button shows when empty.
- [ ] Emoji picker opens, allows selection, inserts emoji at cursor.
- [ ] File attachment opens native file picker with correct accept types.
- [ ] Message context menu (right-click/long-press): Reply, React, Copy, Delete all function.
- [ ] Conversation selection loads messages and updates header.
- [ ] Back button (mobile) returns to contact list.
- [ ] Right panel toggle opens/closes panel.
- [ ] AI/Human mode toggle updates optimistically with toast feedback.
- [ ] Scroll-to-bottom button appears when scrolled up, clicking scrolls to latest.
- [ ] Load-more triggers when scrolling to top of message list.
- [ ] Message search filters visible messages.
- [ ] Edit contact dialog pre-fills and saves correctly.

### Light / Dark Mode

- [ ] Toggle theme: all panels, bubbles, badges, and overlays adapt correctly.
- [ ] Sent bubbles: gold bg with readable foreground in both modes.
- [ ] Received bubbles: muted bg with readable foreground in both modes.
- [ ] Status icons (check, double-check, clock, alert) visible in both modes.
- [ ] SDR suggestion card (`indigo-500/5` bg) readable in both modes.
- [ ] No hardcoded hex colors in any chat component.

### Layout & Responsive

- [ ] Desktop (>= 1024px): 3-panel layout with resizable panels.
- [ ] Tablet (640-1023px): 2-panel layout, right panel as overlay.
- [ ] Mobile (< 640px): Single panel with back navigation.
- [ ] No horizontal scroll at any breakpoint.
- [ ] Message input stays pinned to bottom at all viewport sizes.
- [ ] Virtualized message list fills available height correctly.

### Accessibility

- [ ] All icon-only buttons have `aria-label`.
- [ ] Typing indicator has `aria-live="polite"` and `role="status"`.
- [ ] Media elements have alt text and caption tracks.
- [ ] Keyboard navigation works: Tab through controls, Enter to send, Escape to close.
- [ ] Focus trap in dialogs and sheets.
- [ ] Touch targets >= 44x44px on all interactive elements.
- [ ] Color contrast meets WCAG AA (4.5:1 normal text, 3:1 large text).

### Performance

- [ ] Message list uses `react-virtuoso` (NOT ScrollArea) — verified in code.
- [ ] `MessageBubble` is wrapped in `React.memo` with custom comparator.
- [ ] No `new Date()` or `new Intl.*` in render paths.
- [ ] Static objects/arrays/RegExp hoisted to module scope.
- [ ] Callbacks passed to memoized children stabilized with `useCallback`.
- [ ] `toSorted()` used instead of `.sort()` for immutable array operations.
- [ ] Chat page lazy-loaded in route definition.

### Code Quality

- [ ] `bun run type-check` passes (tsgo, ~4s).
- [ ] `bunx biome check` passes (format + lint).
- [ ] `bun run lint:oxlint:check` passes.
- [ ] No `as any` in chat components.
- [ ] No `console.log` in production code.
- [ ] All tRPC mutations have error handling with toast.
- [ ] No `href="#"` — all action triggers use `<button>`.

---

## 14. Success Criteria

### Measurable Outcomes

| # | Criterion | Target | Measurement Method |
|---|-----------|--------|-------------------|
| 1 | **10,000+ messages render without jank** | < 16ms per frame during scroll | Chrome DevTools Performance panel: no long tasks during Virtuoso scroll. DOM node count stays < 200 regardless of message count. |
| 2 | **SSE reconnects automatically** | < 5s reconnect time after connection drop | Observe SSE reconnect behavior by killing server process; hook must re-establish stream within 5 seconds without user intervention. |
| 3 | **Message send latency** | < 500ms from Enter to message appearing in list | Measure from `handleSend()` invocation to refetch completion. Toast confirms success. |
| 4 | **Time to Interactive (chat page)** | < 3s on 4G throttled connection | Lighthouse CI with 4G throttle. Chat page is lazy-loaded; measure from route transition to interactive state. |
| 5 | **Typing indicator accuracy** | Shows within 200ms of SSE event, auto-hides within 4.5s of last activity | Verify via SSE mock: `typing-start` event triggers indicator appearance; absence of events for 4.5s triggers auto-hide. |
| 6 | **Zero hardcoded colors** | 0 hex values in chat components | `grep -r "#[0-9a-fA-F]{3,8}" apps/web/src/components/chat/` returns no matches (excluding comments). |
| 7 | **Dark mode parity** | All elements render correctly in dark mode | Manual QA toggle light/dark on staging. Screenshot comparison of every panel and dialog. |
| 8 | **Mobile navigation works** | Complete flow: list -> conversation -> right panel -> back | Manual QA on 375px viewport: select conversation, open contact panel, navigate back to list. No stuck states. |
| 9 | **Provider-agnostic rendering** | Same UI for Baileys, Meta, and Z-API conversations | Switch active provider in settings; verify conversation list, messages, and send all function identically. |
| 10 | **Accessibility audit** | 0 critical/serious axe violations | Run `axe-core` on chat page in both light and dark mode. All ARIA labels present, contrast ratios met, focus management correct. |
| 11 | **Bundle size** | Chat chunk < 150KB gzipped | Vite build analysis: lazy-loaded chat chunk (including react-virtuoso, motion/react tree-shaken) stays under budget. |
| 12 | **Memory stability** | No memory leak after 30min active use | Chrome DevTools Memory panel: heap snapshot after 30 minutes of conversation switching and scrolling shows no unbounded growth. SSE listeners properly cleaned up. |

---

## Context Handoff

**Status:** COMPLETED

| Type | Path | Description |
|------|------|-------------|
| Design Spec | `D:\Coders\neondash\docs\design-specs\chat-whatsapp.md` | Complete 14-section L4 design specification for Chat WhatsApp feature |

**Key Decisions:**
- Documented existing architecture accurately from source code — not prescriptive redesign
- Message list uses `react-virtuoso` (NOT ScrollArea) — confirmed in `virtualized-message-list.tsx`
- Animation library is `motion/react` (NOT framer-motion) — confirmed in `sdr-sidebar.tsx`, `typing-indicator.tsx`
- Right panel evolved from separate panels (contact-info, sdr-sidebar) to unified 4-tab `right-panel.tsx`
- Manual refetch with debounce/throttle pattern instead of `refetchInterval` — documented SSE-driven data flow

**Quality Gates:** type-check: N/A (doc only) | lint: N/A | responsive: documented | dark-mode: documented

**Risks/Blockers:** None

**Next Agent Recommendation:** Frontend Specialist for implementation tasks referencing this spec

**Resume Recommendation:** Use this spec as the canonical reference when implementing new chat features, reviewing chat PRs, or onboarding developers to the chat module

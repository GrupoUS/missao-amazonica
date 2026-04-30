# Prompt Planning Report

## 1. Objective

Create and implement, in one complete execution cycle, the full donation platform for **“Missão Amazônica – Sal da Terra”**, using the finalized stack: **Astro SSR/Hybrid, Vercel, Supabase Postgres, Supabase Auth, Supabase Storage, Supabase Realtime, Tailwind CSS, shadcn/ui, Zod, Resend, Sentry and Pix by item using TXID**. The platform must allow public donations by specific item/project, public accountability, admin management, Pix tracking, donor privacy controls, logs, and a scalable design system.

## 2. Scope

- In scope:
  - Full Astro project implementation.
  - Design system and UI components.
  - Public landing page.
  - Donation item listing and detail pages.
  - Pix donation flow by item/project.
  - Supabase database schema.
  - Supabase Auth admin area.
  - Supabase Storage for images and accountability files.
  - Supabase Realtime or polling for donation progress.
  - Admin dashboard.
  - Public accountability page.
  - Audit logs.
  - Responsive desktop/mobile UI.
  - Security rules and RLS policies.
  - Deployment readiness for Vercel.

- Out of scope:
  - Direct bank Pix API integration unless credentials/docs are provided.
  - Mercado Pago or Asaas implementation unless bank API is unavailable.
  - Legal/accounting validation.
  - Final production copywriting for all mission content, which should remain editable in admin.

## 3. Context Snapshot

- Current use case:
  Build a public donation website for a church CNPJ mission called **“Missão Amazônica – Sal da Terra”**, focused on helping riverside communities in the **Rio Negro region** every April for one week.

- End user or consuming system:
  - Public donors.
  - Church administrators.
  - Financial/accountability team.
  - Visitors who want to verify transparency.

- Runtime/model constraints:
  - Astro SSR/Hybrid.
  - Deploy on Vercel.
  - Supabase as the main backend platform.
  - Pix should initially use one church bank account with item-specific QR Codes and TXID.
  - Admin values must not be editable manually; confirmed donations must come from Pix validation/API when available.

- Success priorities:
  - Simplicity.
  - Transparency.
  - Auditability.
  - Low operational cost.
  - Easy admin usage.
  - Clean UX.
  - Reliable donation tracking.
  - Public accountability.

- Known limitations:
  - Bank Pix API/webhook is not yet defined.
  - Bank is not yet chosen.
  - Mission story is editable later.
  - Automatic Pix confirmation depends on bank API/webhook availability.
  - If bank API is unavailable, design fallback support for manual review or future Mercado Pago/Asaas integration.

## 4. Findings

| ID | Finding | Confidence (1-5) | Evidence Type | Impact |
|---|---|---:|---|---|
| F1 | Supabase-first architecture is better than NeonDB + Better Auth for this project because Auth, Storage, Realtime and Postgres are integrated. | 5 | Prior architectural decision | Reduces complexity and maintenance. |
| F2 | Vercel is the best deployment target for Astro SSR/Hybrid in this case. | 5 | Prior architectural decision | Simplifies frontend deployment and API routes. |
| F3 | Pix by item must use item-specific TXID to identify the intended donation target. | 5 | Pix strategy decision | Enables item/project-level tracking. |
| F4 | Donation progress must not be manually editable by admins. | 5 | User requirement | Protects financial integrity. |
| F5 | Public accountability is a core requirement. | 5 | User requirement | Requires expenses, proofs, media and item-level reporting. |
| F6 | Donor display must be consent-based. | 5 | User requirement | Requires privacy controls. |
| F7 | Excess donation value should go to global reserve. | 5 | User requirement | Requires reserve accounting logic. |

## 5. Knowledge Gaps

- Which bank will receive the Pix donations.
- Whether the chosen bank provides:
  - Pix API.
  - Webhook.
  - TXID return.
  - Transaction query endpoint.
  - CNPJ account API access.
- Final domain name.
- Initial donation categories.
- Initial urgency labels.
- Initial admin emails.
- Whether Mercado Pago or Asaas will be needed as fallback.
- Whether the platform must issue donor receipts by email immediately in MVP.

## 6. Evaluation Plan

- Baseline:
  No existing implementation.

- Candidate variants:
  - Variant A: Supabase + Pix TXID + polling/manual pending state.
  - Variant B: Supabase + Pix TXID + bank webhook.
  - Variant C: Supabase + Mercado Pago/Asaas fallback if bank API is unavailable.

- Test set design:
  - Create donation item.
  - Upload image.
  - Generate Pix payload for item.
  - Submit donation form with anonymous donor.
  - Submit donation form with public donor authorization.
  - Simulate payment confirmation.
  - Confirm progress bar update.
  - Confirm excess value goes to global reserve.
  - Add accountability proof.
  - Verify public accountability page.
  - Verify admin login/logout.
  - Verify RLS blocks unauthorized writes.

- Edge cases:
  - Donation without name/email.
  - Donation with public display disabled.
  - Donation above item target.
  - Item with no donations.
  - Item marked urgent.
  - Failed Pix confirmation.
  - Duplicate webhook/payment event.
  - Admin tries to edit collected amount manually.
  - Image upload failure.
  - Missing Pix bank API configuration.

- Metrics:
  - Public pages load correctly.
  - Admin can manage content.
  - Donation records are traceable.
  - RLS prevents unauthorized mutation.
  - Payment events are idempotent.
  - UI remains responsive on mobile.
  - No hardcoded secrets.
  - Build passes.
  - Lint/type checks pass.

- Pass/fail thresholds:
  - Build must pass.
  - Typecheck must pass.
  - All critical flows must work locally.
  - No public write access to protected tables.
  - Donation progress must only derive from confirmed donations/payment events.
  - Admin-only routes must require authentication.

- Rollout recommendation:
  - Deploy MVP with Pix TXID + admin-visible pending donations.
  - Add bank API/webhook once bank is confirmed.
  - Add Mercado Pago/Asaas only if bank integration is not viable.

---

# ONE-SHOT IMPLEMENTATION PROMPT

## Role

You are a senior full-stack engineer, product architect and design system implementer.

You must implement the complete donation platform for **“Missão Amazônica – Sal da Terra”** in one coordinated execution, using the stack and requirements below.

Work with the methodology:

**Analyze → Research → Plan → Implement → Validate**

Do not over-engineer. Prefer the simplest production-ready implementation that satisfies the requirements.

Do not skip validation. Do not leave TODOs for critical flows. If something depends on unavailable external credentials, create a clean abstraction, mock/dev mode and clear integration point.

---

## Product Summary

Build a public donation platform for a church CNPJ mission:

**Name:** Missão Amazônica – Sal da Terra  
**Purpose:** Support riverside communities in the Rio Negro region, Amazon, Brazil.  
**Mission period:** Every April, for one week.  
**Donation model:** Donors choose a specific item/project and donate any amount.  
**Financial model:** Donations go to one church bank account via Pix. Each item/project must have a specific Pix TXID/QR Code for tracking.  
**Transparency model:** Public accountability with totals, proofs, receipts, images and videos.  
**Admin model:** Any admin can create/edit items and publish accountability. All admins have the same permissions in MVP.  

---

## Final Tech Stack

Use:

- Astro SSR/Hybrid
- Vercel deployment adapter
- TypeScript
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Supabase Realtime where useful
- Tailwind CSS
- shadcn/ui
- Zod
- Resend for email-ready architecture
- Sentry-ready error monitoring
- Pix QR Code generation with item/project TXID
- Optional future bank API/webhook abstraction

Do not use:

- NeonDB
- Better Auth
- Railway
- Mercado Pago by default
- Asaas by default

Mercado Pago or Asaas should only exist as future fallback integration points, not as the default payment implementation.

---

## Core Business Rules

1. Donations are tied to a specific item/project.
2. Donor can donate any amount.
3. Donor name, email and phone are optional.
4. Donor can choose anonymous donation.
5. Donor can authorize public display of their name.
6. If donor does not authorize display, do not show personal data publicly.
7. Items/projects have open goals.
8. If a donation causes an item/project to exceed its target/reference amount, the excess must be marked as part of the global reserve.
9. Admin cannot manually edit collected donation totals.
10. Collected totals must derive from confirmed donations/payment events.
11. All admin actions must generate audit logs.
12. Public accountability must be visible.
13. Admin can upload real or illustrative images.
14. Items must support categories.
15. Items must support urgency/priority labels.
16. Admin approval controls whether an item appears publicly.
17. Admin count is unlimited in MVP.
18. All admins have equal permission in MVP.
19. Bank API/webhook is not yet defined, so implement a clean provider abstraction.

---

## Pages to Implement

### 1. Public Landing Page

Route:

```txt
/
````

Must include:

* Hero section.
* Mission name: “Missão Amazônica – Sal da Terra”.
* Short mission explanation.
* Region: Comunidades do Rio Negro.
* Mission period: every April for one week.
* Main CTA: “Contribuir com a missão”.
* Secondary CTA: “Ver prestação de contas”.
* Impact summary cards:

  * Total arrecadado.
  * Projetos ativos.
  * Itens concluídos.
  * Reserva global.
* Featured urgent items.
* Transparency section explaining how donations are tracked.
* Footer with church/mission information.

Content must be editable later through database/admin.

---

### 2. Donation Items Page

Route:

```txt
/doar
```

Must include:

* Grid/list of active approved items.
* Filters:

  * Category.
  * Urgency.
  * Status.
* Search by name.
* Sort options:

  * Most urgent.
  * Highest progress.
  * Newest.
* Donation item cards showing:

  * Image.
  * Title.
  * Category badge.
  * Urgency badge.
  * Short description.
  * Target/reference amount.
  * Confirmed amount.
  * Progress bar.
  * CTA: “Doar para este projeto”.

---

### 3. Donation Item Detail Page

Route:

```txt
/doar/[slug]
```

Must include:

* Item image gallery.
* Item title.
* Category.
* Urgency.
* Description.
* Target/reference amount.
* Confirmed amount.
* Progress bar.
* Explanation if amount exceeded and excess goes to global reserve.
* CTA: “Fazer doação”.
* Donation form/modal.
* Public donor list, showing only authorized names.
* Updates/accountability section for that item.
* Related items.

---

### 4. Donation Flow

Can be modal or dedicated section.

Must include:

* Donation amount input.
* Optional donor name.
* Optional donor email.
* Optional donor phone.
* Anonymous donation toggle.
* Public name authorization checkbox.
* Clear consent text.
* Generate Pix button.
* Pix QR Code display.
* Pix copy-and-paste code.
* Payment status:

  * Pending.
  * Confirmed.
  * Expired/Unavailable if needed.
* Instruction:

  * “Após o pagamento, a confirmação será feita automaticamente se o banco disponibilizar API Pix. Caso contrário, a equipe financeira validará o depósito.”

Important:

* Creating a Pix intent does not mean donation is confirmed.
* Only confirmed payment events should increase totals.

---

### 5. Public Accountability Page

Route:

```txt
/prestacao-de-contas
```

Must include:

* Total raised.
* Total used.
* Global reserve amount.
* List of items/projects.
* Expenses per item.
* Proofs:

  * Receipt/document.
  * Image.
  * Video URL.
* Status:

  * In progress.
  * Purchased.
  * Delivered.
  * Completed.
* Public timeline.

---

### 6. Admin Login

Routes:

```txt
/admin/login
/admin/logout
```

Use Supabase Auth.

Admin login should support email/password at MVP level.

Do not expose admin registration publicly unless explicitly protected.

---

### 7. Admin Dashboard

Route:

```txt
/admin
```

Must require authenticated admin.

Dashboard cards:

* Total confirmed donations.
* Total pending donations.
* Active items.
* Completed items.
* Global reserve.
* Recent donations.
* Recent audit logs.

---

### 8. Admin Items Management

Routes:

```txt
/admin/items
/admin/items/new
/admin/items/[id]/edit
```

Admins can:

* Create item/project.
* Edit title, description, category, urgency, target/reference amount.
* Upload image.
* Choose image type: real or illustrative.
* Approve/publish item.
* Archive item.
* View item progress.
* View related donations.
* View audit history.

Admins cannot:

* Edit confirmed collected amount directly.
* Delete confirmed donation history.

---

### 9. Admin Donations Management

Route:

```txt
/admin/donations
```

Admins can:

* View donations.
* Filter by:

  * Status.
  * Item.
  * Date.
  * Donor visibility.
* View payment event payloads.
* See pending Pix intents.
* See confirmed donations.
* Export CSV.

Do not allow manual amount editing.

If manual confirmation is implemented as temporary MVP fallback, it must:

* Be clearly marked as manual verification.
* Require admin confirmation notes.
* Generate audit log.
* Be replaceable by bank API/webhook later.
* Never silently alter totals without event history.

---

### 10. Admin Accountability Management

Routes:

```txt
/admin/accountability
/admin/accountability/new
/admin/accountability/[id]/edit
```

Admins can:

* Add expenses.
* Link expense to item/project or global reserve.
* Upload proof files.
* Add descriptions.
* Add public notes.
* Add delivery photos/videos.
* Mark status.

All accountability entries must be public-ready.

---

### 11. Admin Settings

Route:

```txt
/admin/settings
```

Must include:

* Mission editable content.
* Pix key configuration.
* Bank name field.
* Bank API status:

  * Not configured.
  * Manual verification.
  * API configured.
  * Webhook configured.
* Domain display field.
* Contact email.
* Social links.
* Optional fallback payment provider fields for future:

  * Mercado Pago disabled.
  * Asaas disabled.

Do not require Mercado Pago or Asaas credentials.

---

## Data Model

Implement Supabase schema with migrations.

Use tables similar to:

```sql
missions
- id uuid primary key
- title text not null
- slug text unique not null
- description text
- region text
- mission_month text default 'April'
- mission_duration_days integer default 7
- is_active boolean default true
- created_at timestamptz default now()
- updated_at timestamptz default now()

categories
- id uuid primary key
- name text not null
- slug text unique not null
- description text
- created_at timestamptz default now()

donation_items
- id uuid primary key
- mission_id uuid references missions(id)
- category_id uuid references categories(id)
- title text not null
- slug text unique not null
- description text
- image_url text
- image_type text check in ('real', 'illustrative')
- urgency text check in ('low', 'medium', 'high', 'urgent')
- target_amount_cents integer
- status text check in ('draft', 'published', 'archived', 'completed')
- approved_by uuid
- approved_at timestamptz
- pix_txid text unique
- pix_payload text
- created_at timestamptz default now()
- updated_at timestamptz default now()

donation_intents
- id uuid primary key
- item_id uuid references donation_items(id)
- amount_cents integer not null
- donor_name text
- donor_email text
- donor_phone text
- is_anonymous boolean default false
- display_name_publicly boolean default false
- status text check in ('pending', 'confirmed', 'expired', 'cancelled', 'failed')
- pix_txid text not null
- pix_payload text
- pix_qr_url text
- expires_at timestamptz
- confirmed_at timestamptz
- created_at timestamptz default now()

payment_events
- id uuid primary key
- donation_intent_id uuid references donation_intents(id)
- provider text default 'bank_pix'
- event_type text not null
- bank_end_to_end_id text
- txid text
- amount_cents integer
- raw_payload jsonb
- received_at timestamptz default now()
- unique(provider, bank_end_to_end_id)

global_reserve_entries
- id uuid primary key
- donation_intent_id uuid references donation_intents(id)
- source_item_id uuid references donation_items(id)
- amount_cents integer not null
- reason text
- created_at timestamptz default now()

accountability_entries
- id uuid primary key
- item_id uuid references donation_items(id)
- reserve_entry_id uuid references global_reserve_entries(id)
- title text not null
- description text
- amount_cents integer
- proof_url text
- media_url text
- status text check in ('planned', 'purchased', 'delivered', 'completed')
- is_public boolean default true
- created_by uuid
- created_at timestamptz default now()
- updated_at timestamptz default now()

audit_logs
- id uuid primary key
- actor_id uuid
- action text not null
- entity_type text not null
- entity_id uuid
- before_data jsonb
- after_data jsonb
- created_at timestamptz default now()

settings
- id uuid primary key
- key text unique not null
- value jsonb
- updated_at timestamptz default now()
```

Create views or database functions for:

* confirmed amount by item.
* public donor list.
* global reserve total.
* accountability totals.
* landing page stats.

Do not store collected amount as manually editable truth. Use computed totals or database views derived from confirmed donations/payment events.

---

## Supabase Security Requirements

Implement RLS policies.

Public can:

* Read published donation items.
* Read public accountability entries.
* Read public mission content.
* Read public donor names only if allowed.

Public cannot:

* Write directly to protected tables.
* Read private donor email/phone.
* Read raw payment events.
* Read audit logs.

Authenticated admins can:

* Manage items.
* Manage accountability.
* View donations.
* View payment events.
* View audit logs.
* Manage settings.

Use a safe admin detection approach:

* Create `admin_users` table linked to Supabase Auth user ID.
* Only users in `admin_users` can access admin functions.

---

## Pix Implementation

Implement Pix as a provider abstraction.

Create:

```txt
src/lib/payments/
  pix.ts
  providers/
    bank-pix-provider.ts
    manual-provider.ts
    mercado-pago-provider.disabled.ts
    asaas-provider.disabled.ts
```

Default provider:

```txt
bank_pix
```

Requirements:

* Generate Pix payload with:

  * Church Pix key from settings.
  * Item-specific TXID.
  * Donation amount.
  * Merchant name.
  * Merchant city.
* Generate QR Code image/data URL.
* Store Pix payload and TXID in donation intent.
* Never mark donation confirmed at QR generation time.
* Confirmation must happen through:

  * payment event webhook, or
  * temporary manual verification flow, or
  * future bank API query.

Create webhook route placeholder:

```txt
/api/webhooks/bank-pix
```

It should:

* Verify request if secret exists.
* Parse payload.
* Extract TXID, amount, end-to-end ID.
* Idempotently store payment event.
* Match donation intent by TXID and amount where possible.
* Mark donation intent confirmed.
* Create global reserve entry if needed.
* Trigger realtime update.

If bank API is not configured, return a clear 501/disabled response in production-safe manner.

---

## Donation Excess Logic

When confirming donation:

1. Calculate confirmed total for item before current donation.
2. Calculate item target/reference amount.
3. If target exists and donation pushes total above target:

   * Confirm full donation.
   * Attribute up to remaining target to item.
   * Attribute excess to global reserve.
4. Do not reject excess donation.
5. Public UI must explain excess allocation.

---

## Design System Requirements

Implement a clean, trustworthy, Amazon-inspired design system.

Visual direction:

* Deep forest green.
* River teal/blue.
* Warm earth neutrals.
* White/off-white backgrounds.
* High readability.
* Minimal and human.
* No aggressive sales styling.

Components:

* Button variants:

  * Primary.
  * Secondary.
  * Ghost.
  * Destructive.
* Cards:

  * Donation item card.
  * Metric card.
  * Admin card.
  * Accountability card.
* Progress bar:

  * Normal.
  * Nearly complete.
  * Exceeded.
* Badges:

  * Category.
  * Urgency.
  * Status.
* Form inputs.
* Amount input.
* QR Code container.
* Donor visibility controls.
* Modal.
* Toast/alert.
* Empty states.
* Loading states.
* Error states.
* Admin table.
* File upload.
* Timeline.

Ensure mobile-first responsive behavior.

---

## Suggested Project Structure

Use this or a similarly clean structure:

```txt
src/
  components/
    ui/
    layout/
    donation/
    admin/
    accountability/
  layouts/
    PublicLayout.astro
    AdminLayout.astro
  pages/
    index.astro
    doar/
      index.astro
      [slug].astro
    prestacao-de-contas.astro
    admin/
      index.astro
      login.astro
      items/
      donations/
      accountability/
      settings.astro
    api/
      donations/
        create.ts
        status.ts
      webhooks/
        bank-pix.ts
      admin/
  lib/
    supabase/
    db/
    auth/
    payments/
    email/
    monitoring/
    validators/
    formatters/
  styles/
    globals.css
  middleware.ts
supabase/
  migrations/
  seed.sql
```

---

## Implementation Phases

Execute in phases, but complete the full implementation in one shot.

### Phase 1 — Project Setup

* Verify Astro project setup.
* Add TypeScript strict config.
* Install/configure:

  * Tailwind.
  * shadcn/ui.
  * Supabase client/server helpers.
  * Zod.
  * QR Code generator.
  * Resend.
  * Sentry-ready config.
* Add environment variable examples.

Expected output:

* Project builds.
* Styling works.
* Supabase connection utility exists.

---

### Phase 2 — Database and Security

* Create migrations.
* Create required tables.
* Create views/functions for totals.
* Create RLS policies.
* Create seed data:

  * Mission.
  * Categories.
  * Example items.
  * Example admin placeholder.
* Add audit log helpers.

Expected output:

* Supabase schema is ready.
* Public/admin access is separated.
* Totals are derived safely.

---

### Phase 3 — Auth and Admin Guard

* Implement Supabase Auth login.
* Implement admin route protection.
* Add admin middleware/guard.
* Create admin layout.
* Add logout.
* Add admin user check from `admin_users`.

Expected output:

* Public pages accessible.
* Admin pages protected.
* Non-admin users blocked.

---

### Phase 4 — Design System

* Implement global theme tokens.
* Implement reusable UI components.
* Implement public layout.
* Implement admin layout.
* Implement responsive navigation.
* Implement footer.

Expected output:

* Consistent UI system.
* Reusable components.
* Mobile and desktop support.

---

### Phase 5 — Public Pages

* Landing page.
* Donation listing.
* Item detail page.
* Accountability page.
* Filters/search/sort.
* Public donor visibility logic.

Expected output:

* Donor can browse mission and items.
* Public can verify accountability.
* Only authorized donor names appear.

---

### Phase 6 — Donation Flow and Pix

* Implement donation form.
* Validate with Zod.
* Create donation intent.
* Generate item-specific Pix TXID.
* Generate Pix payload.
* Generate QR Code.
* Store pending donation.
* Show QR and copy-paste code.
* Show pending/confirmed status.
* Implement status endpoint.

Expected output:

* Donor can create Pix donation intent.
* Donation does not count until confirmed.
* QR Code is item/project-specific.

---

### Phase 7 — Payment Confirmation Layer

* Implement payment provider abstraction.
* Implement bank Pix webhook placeholder.
* Implement idempotency.
* Implement confirmation logic.
* Implement excess-to-reserve logic.
* Implement event storage.
* Add manual verification fallback only if necessary and clearly marked.

Expected output:

* Payment event can confirm donation.
* Duplicate events do not duplicate totals.
* Excess value goes to global reserve.

---

### Phase 8 — Admin Management

* Admin dashboard.
* Items CRUD.
* Image upload to Supabase Storage.
* Donations view.
* Accountability CRUD.
* Settings page.
* CSV export.
* Audit log display.

Expected output:

* Admin can operate the full platform.
* Every critical action is logged.
* Financial values remain protected.

---

### Phase 9 — Realtime / Progress Updates

* Use Supabase Realtime or safe polling.
* Donation pages update progress after confirmation.
* Admin dashboard updates recent donations.
* Show clear loading and stale states.

Expected output:

* Progress bars update without full manual refresh where possible.

---

### Phase 10 — Email and Notifications

* Add Resend integration wrapper.
* Create email templates for:

  * Donation intent created.
  * Donation confirmed.
  * Admin notification for pending/manual review.
* If Resend key is missing, fail gracefully and log.

Expected output:

* Email-ready infrastructure exists.
* No hard failure if not configured in dev.

---

### Phase 11 — Monitoring and Error Handling

* Add Sentry-ready setup.
* Add structured error handling.
* Add user-friendly error pages.
* Add server-side logging for payment/webhook events.

Expected output:

* Production issues are traceable.

---

### Phase 12 — Validation and Deployment Readiness

Run:

```bash
npm run build
npm run typecheck
npm run lint
```

Also validate manually:

* Landing page loads.
* Item listing loads.
* Item detail loads.
* Donation intent can be created.
* Pix QR appears.
* Pending donation does not increase total.
* Simulated confirmation increases total.
* Excess goes to reserve.
* Admin login works.
* Admin can create item.
* Admin can upload image.
* Admin cannot manually edit collected amount.
* Accountability page displays public proofs.
* RLS blocks unauthorized writes.
* Environment variables are documented.

Expected output:

* App is ready for Vercel deployment.

---

## Environment Variables

Create `.env.example` with:

```txt
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PUBLIC_SITE_URL=
PUBLIC_SITE_NAME="Missão Amazônica – Sal da Terra"

PIX_KEY=
PIX_MERCHANT_NAME=
PIX_MERCHANT_CITY=
PIX_BANK_WEBHOOK_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

SENTRY_DSN=
```

Never expose service role key to the browser.

---

## Acceptance Criteria

The implementation is complete only when:

* Public site exists and is responsive.
* Admin authentication works.
* Admin-only routes are protected.
* Donation items can be created and published.
* Donation flow generates Pix QR Code by item/project.
* Donation is pending until confirmed.
* Confirmed donations update item progress.
* Donor public visibility respects consent.
* Excess donation is allocated to global reserve.
* Public accountability page works.
* Supabase Storage handles images/proofs.
* Audit logs are created.
* RLS policies protect private data.
* Build/typecheck/lint pass.
* Vercel deployment config is ready.
* Bank Pix API can be added later without rewriting the donation system.

---

## Final Instruction

Start by inspecting the current project structure. If no project exists, create the Astro project structure from scratch.

Then implement all phases in order.

Do not stop after planning. Implement, validate and report:

1. Files created/changed.
2. Database migrations added.
3. Environment variables required.
4. How to run locally.
5. How to deploy on Vercel.
6. What remains dependent on bank API/webhook confirmation.

---
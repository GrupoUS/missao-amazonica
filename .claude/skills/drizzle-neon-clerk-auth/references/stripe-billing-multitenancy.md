# Stripe Billing and Multitenancy Reference

Use this reference when a NeonDash change touches Stripe Checkout, subscription webhooks, billing ownership, or plan-to-feature access. Keep a clear separation between:

- **Stripe as billing source of truth**
- **NeonDash DB as projected application state**
- **Clerk metadata as a cached auth snapshot, not the canonical billing ledger**

## What Stripe documents directly

### Reconciliation fields

Stripe documents three different reconciliation surfaces for Checkout-based subscriptions:

| Field                        | Lives On         | Purpose                                                                               |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `client_reference_id`        | Checkout Session | Internal lookup key for your app's billing owner, cart, or tenant anchor              |
| `metadata`                   | Checkout Session | Session-scoped context visible in events like `checkout.session.completed`            |
| `subscription_data.metadata` | Subscription     | Subscription-scoped ownership and plan context copied onto the resulting subscription |

Use all three intentionally. Do not overload one field with every concern.

Recommended split:

- `client_reference_id`: stable internal billing owner ID
- Checkout `metadata`: `initiatedByUserId`, `tenantId`, UX/source context
- `subscription_data.metadata`: `billingOwnerId`, `ownershipModel`, `planKey`, `tenantId`

Example payload shape:

```json
{
  "client_reference_id": "billing_account:42",
  "metadata": {
    "tenantId": "clinica:18",
    "initiatedByUserId": "91",
    "source": "settings-billing"
  },
  "subscription_data": {
    "metadata": {
      "billingOwnerId": "billing_account:42",
      "ownershipModel": "tenant",
      "planKey": "pro_433",
      "tenantId": "clinica:18"
    }
  }
}
```

### Webhook guarantees and limits

Stripe documents these constraints explicitly:

- Verify signatures with `stripe.webhooks.constructEvent(...)`
- Expect duplicate deliveries; dedupe by `event.id`
- In some duplicate scenarios, also use `event.type + data.object.id`
- Do not depend on event ordering; Stripe does not guarantee it
- Refetch the subscription, invoice, or customer from the API when event order leaves your local projection incomplete

This means NeonDash should not treat the success redirect as proof that access is active. Access changes belong in webhook-driven projections.

### Entitlements

Stripe Entitlements is the official product-feature mapping model. Stripe also recommends persisting active entitlements internally for faster resolution.

Use that recommendation literally:

- Stripe determines what the customer bought
- NeonDash persists a fast local projection for auth checks and UI gating
- Clerk metadata mirrors the result for quick session hydration, but should not be the only store

### Multi-account / multi-entity separation

When multiple Stripe accounts or legal entities exist, Stripe recommends separate accounts with separate customers, subscriptions, and product catalogs. Stripe also documents that you should store both `customer_id` and `stripe_account_id` so you know which Stripe account owns the subscription and payment methods.

## Derived NeonDash guidance

Stripe gives primitives, not one mandatory SaaS tenancy model. The guidance below is derived from Stripe's documented objects and webhook behavior.

### Decide who owns the Stripe customer

| Case                                      | Who pays in Stripe                             | Who uses NeonDash                      | Recommended ownership model       |
| ----------------------------------------- | ---------------------------------------------- | -------------------------------------- | --------------------------------- |
| Individual subscription                   | One user                                       | That same user                         | `user-billed`                     |
| Clinic / workspace subscription           | Tenant owner or billing admin                  | Multiple members in same tenant        | `tenant-billed`                   |
| Multiple legal entities / Stripe accounts | Billing owner inside a specific Stripe account | Tenant members under that legal entity | `tenant-billed + stripeAccountId` |

### Decision table

| Question                                                        | If yes                                                                                  | If no                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Does one subscription cover multiple app users?                 | Use one Stripe Customer for the billing owner, then grant app access through membership | Keep the subscription attached to a single user          |
| Can users belong to the same tenant but not all pay separately? | Separate billing ownership from membership                                              | Per-user billing snapshot is acceptable                  |
| Do you operate more than one Stripe account or legal entity?    | Persist `stripeAccountId + stripeCustomerId + stripeSubscriptionId` together            | A single-account customer/subscription mapping is enough |

### User-billed model

Use this when each person buys and owns their own access.

Recommended mapping:

- One app user -> one Stripe Customer
- One active subscription snapshot can live on `users`
- `billingPlan`, `billingStatus`, `stripeCustomerId`, and `stripeSubscriptionId` on `users` are acceptable for fast auth checks

This matches NeonDash's current simplified model.

### Tenant-billed model

Use this when one subscription governs access for multiple users in a clinic, workspace, or org.

Recommended mapping:

- One tenant billing owner -> one Stripe Customer
- Members inherit access through membership or tenant linking, not through copied Stripe IDs on each user
- Store the subscription on a tenant-oriented billing record, then project the resulting access to members

Do not duplicate the same `stripeSubscriptionId` onto every user row. That conflates payment ownership with authorization.

### Multi-account Stripe model

Use this when one app can bill through multiple Stripe accounts, brands, or legal entities.

Persist all three together:

- `stripeAccountId`
- `stripeCustomerId`
- `stripeSubscriptionId`

Without `stripeAccountId`, the same `customerId` is ambiguous across accounts, and entitlement checks can hit the wrong product catalog.

## Source-of-truth flow

Preferred projection chain:

```text
Stripe Checkout / Subscription / Invoice / Entitlements
  -> verified Stripe webhook
  -> NeonDash billing projection tables
  -> optional denormalized snapshot on users / tenant
  -> Clerk publicMetadata snapshot for fast auth hydration
```

Rules:

1. Stripe webhook events update billing state
2. Local DB stores the canonical app-side projection
3. Clerk mirrors the projection for session convenience
4. UI reads app projection, not raw Stripe redirect state

## Plan separation vs feature separation

Keep these concerns separate:

- **Price / product**: what Stripe sold
- **Internal plan key**: what NeonDash calls the commercial package (`basic_193`, `pro_433`)
- **Entitlements / features**: what capabilities are enabled

For simple catalogs, mapping `priceId -> planKey` is enough. As the catalog grows, prefer a projection that can answer both:

- Which commercial plan is active?
- Which features are active regardless of price migrations, experiments, or legacy prices?

## Webhook projection checklist

- Verify the raw body signature first
- Log `event.id`, `event.type`, `data.object.id`, and the billing owner key
- Ignore duplicates already processed
- When an event arrives before another related event, refetch the missing object from Stripe
- Update local projection tables first
- Sync derived snapshots to `users`, tenant records, and Clerk last

Useful events for subscription flows:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `entitlements.active_entitlement_summary.updated`

## Case: NeonDash monthly vs annual rollout (2026-04)

This section captures the concrete repo patterns discovered during the real NeonDash rollout.

### What changed in the repo

- Shared plan catalog moved to dual-interval pricing in `packages/shared/src/plans.ts`
- Checkout now accepts `billingInterval` and writes owner context into `customer.metadata`, `session.metadata`, and `subscription_data.metadata`
- Webhooks project Stripe state into `billing_accounts`, `billing_subscriptions`, `billing_entitlements`, and `stripe_webhook_events`
- Cancellation downgrade preserves the current billing interval by resolving it from the active Stripe `price.id`

### Repo-specific rules worth following every time

1. Update price resolution in both directions.
   - Forward: `planId + billingInterval -> env var key`
   - Reverse: `priceId -> { planId, billingInterval }`
   - If only the forward mapping exists, Checkout works but webhooks and downgrade logic drift.

2. Treat the billing projection as first-class, not optional.
   - `users` remains a fast snapshot
   - `billing_accounts` is the app-side billing owner record
   - `billing_subscriptions` is the Stripe subscription projection
   - `billing_entitlements` is the fast feature projection
   - `stripe_webhook_events` is the dedupe ledger

3. Resolve webhook ownership in this order:
   - `session.metadata.userId` or `subscription.metadata.userId`
   - `client_reference_id -> billing_account:{id}`
   - only then consider the event insufficient to reconcile

4. Prefer repair-on-read over sync sprawl.
   - `billing.getSubscriptionStatus` can self-heal missing projection rows when `ctx.user.stripeCustomerId` exists
   - use that pattern instead of inventing one-off sync endpoints

5. Preserve interval when downgrading or changing plans.
   - read the current subscription item's `price.id`
   - map it back to `billingInterval`
   - choose the replacement price from the same interval family

### Anti-pattern discovered

```typescript
// Wrong: only update checkout env mapping
getPriceEnvKey(planId, billingInterval);

// ...but forget reverse mapping from Stripe price -> interval
planFromPriceId(priceId);
```

```typescript
// Correct: maintain both directions in the shared catalog
getPriceEnvKey(planId, billingInterval);
resolvePlanSelectionFromPriceId(priceId);
billingIntervalFromPriceId(priceId);
```

## Case: Stripe live catalog management

### Officially aligned rule

Stripe recurring prices are effectively immutable for commercial changes. When the amount changes, create a new `Price` and move new sales to it. Preserve old prices for existing subscribers.

### NeonDash application

- `Product` remains the commercial plan identity (`Essential`, `Pro`)
- monthly vs annual are separate recurring `Price` objects on the same product
- `lookup_key` should be stable for the current sellable price (`neondash_essential_monthly`, `neondash_pro_annual`, etc.)
- when replacing a current price that already has a `lookup_key`, prefer moving the key with Stripe's lookup-key transfer support instead of changing app code everywhere
- if an old price is still referenced by active subscribers, keep it and mark it as legacy/deprecated in Stripe metadata instead of deleting it

### Recommended Stripe metadata for NeonDash prices

- `billing_interval`: `monthly` or `annual`
- `helper_text`: `Billed monthly` or `Billed annually`
- `billing_display`: `per_month`
- `ui_price_monthly`: commercial monthly-equivalent shown in UI
- `ui_price_annual_total`: annual total when relevant
- `source`: operational origin such as `cli-config`

### Anti-pattern discovered

```text
Wrong: overwrite the current monthly recurring price amount in place and assume existing subscriptions should switch automatically.
```

```text
Correct: create a new Price, point new checkouts to it, keep the old Price for legacy subscribers, and make the legacy state explicit in nickname/metadata.
```

## Operational note: Stripe CLI and `.env`

In NeonDash, do not assume `.env` can be safely sourced with `set -a && . ./.env`.

Reason:

- some env values contain spaces or angle brackets (for example display emails)
- shell sourcing can break before Stripe keys are loaded

Safer pattern for CLI automation in this repo:

```python
from pathlib import Path

env = {}
for line in Path(".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    if key.startswith("STRIPE_"):
        env[key] = value
```

Use Python to parse `.env`, then pass the loaded Stripe keys into CLI subprocesses. This is faster and safer than debugging shell-parse failures mid-operation.

## Drizzle modeling appendix

These are documented patterns for schema design, not mandatory tables.

### `billingAccounts`

Represents the billable owner. This is the table that answers who owns the Stripe customer.

```typescript
export const billingAccounts = pgTable(
  "billing_accounts",
  {
    id: serial("id").primaryKey(),
    ownerUserId: integer("owner_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    tenantAnchorId: integer("tenant_anchor_id"),
    ownershipModel: varchar("ownership_model", { length: 32 }).notNull(),
    stripeAccountId: varchar("stripe_account_id", { length: 255 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    currentPlanKey: varchar("current_plan_key", { length: 64 }),
    billingStatus: varchar("billing_status", { length: 32 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => [
    index("billing_accounts_owner_user_idx").on(table.ownerUserId),
    index("billing_accounts_tenant_anchor_idx").on(table.tenantAnchorId),
    index("billing_accounts_customer_idx").on(table.stripeCustomerId),
  ]
);
```

### `billingAccountMembers`

Maps app users to the billing account that grants their access.

```typescript
export const billingAccountMembers = pgTable(
  "billing_account_members",
  {
    id: serial("id").primaryKey(),
    billingAccountId: integer("billing_account_id")
      .notNull()
      .references(() => billingAccounts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("billing_account_members_billing_account_idx").on(
      table.billingAccountId
    ),
    index("billing_account_members_user_idx").on(table.userId),
    uniqueIndex("billing_account_members_unique_idx").on(
      table.billingAccountId,
      table.userId
    ),
  ]
);
```

### `billingSubscriptions`

Stores Stripe subscription-level projection. Useful when one billing account can have historical or multiple subscriptions over time.

```typescript
export const billingSubscriptions = pgTable(
  "billing_subscriptions",
  {
    id: serial("id").primaryKey(),
    billingAccountId: integer("billing_account_id")
      .notNull()
      .references(() => billingAccounts.id, { onDelete: "cascade" }),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 255,
    }).notNull(),
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    stripeProductId: varchar("stripe_product_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull(),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    lastStripeEventId: varchar("last_stripe_event_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => [
    index("billing_subscriptions_billing_account_idx").on(
      table.billingAccountId
    ),
    uniqueIndex("billing_subscriptions_stripe_subscription_idx").on(
      table.stripeSubscriptionId
    ),
  ]
);
```

### `billingEntitlements`

Optional local projection of Stripe Entitlements for fast app checks.

```typescript
export const billingEntitlements = pgTable(
  "billing_entitlements",
  {
    id: serial("id").primaryKey(),
    billingAccountId: integer("billing_account_id")
      .notNull()
      .references(() => billingAccounts.id, { onDelete: "cascade" }),
    featureKey: varchar("feature_key", { length: 128 }).notNull(),
    sourceProductId: varchar("source_product_id", { length: 255 }),
    active: boolean("active").default(true).notNull(),
    expiresAt: timestamp("expires_at"),
    lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  },
  table => [
    index("billing_entitlements_billing_account_idx").on(
      table.billingAccountId
    ),
    uniqueIndex("billing_entitlements_account_feature_idx").on(
      table.billingAccountId,
      table.featureKey
    ),
  ]
);
```

## When denormalized snapshots still help

Even with normalized billing tables, a denormalized subset on `users` can still be useful for fast auth and onboarding decisions.

Good snapshot fields:

- current plan key
- current billing status
- current period end
- `cancelAtPeriodEnd`

Avoid storing ownership fields redundantly on every user when a tenant owns the subscription.

## Anti-patterns

- Creating one Stripe Customer per user when the bill actually belongs to a tenant
- Copying one tenant subscription ID onto every member user row
- Gating product access only from frontend plan state
- Treating Stripe redirect success as the canonical activation signal
- Omitting `stripeAccountId` in multi-account setups
- Hardcoding feature access only from price IDs once the catalog grows beyond a few stable prices

# Luna Ravintola Online Ordering MVP — Project Plan

**Status:** Phase 0 complete; awaiting approval before application-code changes.

## Existing architecture

The current project is a static, bilingual single-page site:

- HTML: `index.html` (the menu and prices are hard-coded here).
- Styling: `styles.css` (custom CSS; no component library).
- Browser behaviour: `script.js` (theme, language, menu tabs, animations, and slideshow).
- Hosting: Vercel, configured as a static deployment in `vercel.json`.
- Backend, database, authentication, payment, email, and API routes: none.

The source repository is `TamidToki/luna-ravintola`. The two public URLs supplied return identical HTML at inspection time, but this local checkout is at `e846087` while remote `main` is at `6cc62bd`; the live deployment screenshot also identifies `6cc62bd`. Therefore the local checkout cannot yet be confirmed as the exact production source. Reconcile that difference before deployment.

## Approved-scope proposal

Keep the existing static site and its visual design. Add a small server-side layer through Vercel Functions, rather than rewriting the site or exposing secrets in the browser.

1. Add a client-side cart and item customisation UI that draws from a structured menu catalogue.
2. Add server endpoints to validate an order, calculate all prices from trusted data, and create a Stripe Checkout Session in **test mode**.
3. Store orders and trusted menu data in Supabase Postgres, with SQL migrations and a seed/import process.
4. Verify Stripe events in a raw-body webhook endpoint; only that endpoint can set an order to paid.
5. Use Supabase Auth plus a database-backed `owner` role for the private owner dashboard. Every owner API call will validate the authenticated user server-side.
6. Send post-payment notifications through Resend only after a verified, idempotently processed webhook.

Supabase and Resend are proposed providers, not yet configured. They should be confirmed by the owner before their accounts, region, sender domain, retention, and costs are chosen.

## Proposed layout

```text
api/
  checkout-session.js       # validates cart and creates Stripe session
  stripe-webhook.js         # raw-body, signature-verified webhook
  admin/orders.js           # authorised owner-only read/update actions
  admin/auth.js             # optional session helpers if required
lib/
  catalog.js                # server-trusted IDs, prices and option rules
  pricing.js                # integer-cent total calculation
  validation.js             # request validation
  db.js                     # server-only database client
  auth.js                   # owner-role verification
  email.js                  # idempotent notification dispatch
menu/
  catalog.js                # browser-safe menu display data
supabase/
  migrations/               # schema and indexes
  seed.sql                  # initial approved menu import
tests/
  ...
```

Existing `index.html`, `styles.css`, and `script.js` will be extended in phases, not replaced. The precise JavaScript module arrangement will be selected while preserving the static site’s loading pattern.

## Proposed database schema

All money is stored as integer euro cents. Customer data is visible only to authorised staff.

| Table | Important fields | Purpose |
| --- | --- | --- |
| `menu_items` | `id`, `slug`, names, category, `base_price_cents`, `active`, `image_url` | Trusted purchasable products. |
| `menu_option_groups` | `id`, `menu_item_id`, name, min/max selection, `required` | Sizes, sides, and topping rules. |
| `menu_options` | `id`, group ID, name, `price_delta_cents`, `active` | Valid item choices. |
| `orders` | `id`, `order_number`, contact/delivery fields, monetary snapshot, fulfilment type, payment/order status, Stripe IDs, timestamps | One durable order record. |
| `order_items` | `id`, order ID, item/option snapshots, unit price, quantity, line total, note | Immutable record of what was purchased. |
| `order_status_history` | `id`, order ID, old/new status, actor, timestamp, note | Audit trail for owner actions. |
| `stripe_events` | Stripe event ID, type, received/processed timestamps, order ID | Webhook idempotency. |
| `notification_deliveries` | order ID, notification type, provider ID, sent timestamp | Prevents duplicate owner/customer emails. |
| `profiles` | auth user ID, role (`owner`/`staff`), active | Authorisation mapping; one initial owner account. |
| `restaurant_settings` | delivery fee/minimum/order rules | Editable configuration with owner-approved values. |

Indexes: unique `orders.order_number`, `orders.stripe_checkout_session_id`, `stripe_events.stripe_event_id`, and common indexes on order status, payment status, creation time, and history/order foreign keys.

## Required configuration (names only)

```dotenv
APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
OWNER_NOTIFICATION_EMAIL=
```

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` are server-only. No values will be committed or entered in chat. `SUPABASE_ANON_KEY` is intentionally public but will still be restricted by Auth/RLS configuration.

## Phases and acceptance criteria

| Phase | Complexity | Acceptance criteria |
| --- | --- | --- |
| 0 — inspection and plan | Complete | Architecture and risks inspected; required planning/security/testing/setup documentation exists; no application code changed. |
| 1 — cart UI | Medium | Responsive cart supports approved items/options/notes/quantities and accurate client display; clear empty/error/validation states; no payment capability. |
| 2 — checkout data and database | High | Validated order creation persists server-calculated snapshots; delivery rules are configurable; no browser total is trusted. |
| 3 — Stripe test Checkout | Medium | Server creates EUR test Checkout sessions from trusted pricing; return pages never mark payment paid. |
| 4 — secure webhook | High | Raw-body signature verification, idempotency, payment transitions, and tests for invalid/replayed events work. |
| 5 — owner dashboard | High | Authenticated owner-only order access and status history work; no public order/customer endpoint exists. |
| 6 — email | Medium | Verified payment triggers one owner notice and optional customer confirmation, with development-safe mode. |
| 7 — launch review | High | Automated/manual checklist, security review, owner approval of rules, test-mode payment, deployment verification, and rollback instructions are complete. |

## Risks and owner decisions needed

- Confirm the authoritative Git branch/commit and whether the supplied local checkout should replace current production.
- Confirm which menu items, sizes, toppings, side choices, allergens, and prices are currently orderable. The HTML menu includes display-only text and has no stable product IDs.
- Confirm delivery area/postal codes, delivery fee, minimum order, collection timing, kitchen capacity, and opening-hours behaviour. No legal, VAT, or refund rules will be invented.
- Confirm whether delivery is available at launch, who fulfils it, and any address validation requirement.
- Confirm Finnish/EU GDPR roles: data controller contact, retention/deletion period, privacy notice, and staff who may access orders.
- Confirm Stripe business onboarding, test vs live launch approval, Supabase region/plan, sender domain, and recipient email address.
- The configured Git remote currently contains an embedded credential. Revoke it and replace the remote with a credential-free HTTPS/SSH URL before pushing.
- Static Vercel rewrites may need to be narrowed so `/api/*` functions are reached; verify this in a preview deployment.

## Security constraints

- Prices, totals, item IDs, option IDs, and delivery fees are recalculated server-side in integer cents.
- Stripe secret keys and webhook secrets never reach browser code.
- Webhook processing verifies signatures from the raw request body and deduplicates by Stripe event ID.
- A success URL is informational only; it does not change payment status.
- Dashboard access requires authenticated users with an authorised database role.
- Customer data is minimised, access-controlled, and excluded from logs and public responses.


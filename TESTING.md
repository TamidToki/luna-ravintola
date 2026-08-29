# Testing Record

**Current phase:** 0 — planning only. No application code has been added, so no payment or order tests have been executed.

## Phase 0 checks

| Test | Expected | Actual | Status |
| --- | --- | --- | --- |
| Inspect project stack | Identify framework/build/API/database status | Static HTML/CSS/JS; `npx serve`; no API/database/backend | Pass |
| Inspect menu source | Identify whether menu is hard-coded or fetched | Products/prices/options are display markup in `index.html` | Pass |
| Inspect deployed URLs | Determine whether supplied URLs are equivalent visual references | Both URLs returned the same HTML hash during inspection | Pass |
| Compare source state | Identify whether local source exactly matches remote/live source | Local HEAD and remote `main` differ; live commit needs reconciliation | Needs owner action |
| Check for existing payment/auth | Detect existing integrations | None found in tracked app files | Pass |

## Required tests by later phase

### Phase 1 — cart

- Add/remove/update quantities, variations, toppings/sides, notes, subtotal, and responsive viewport behaviours.
- Empty-cart, malformed input, unavailable item, localisation, keyboard, and error-state tests.

### Phases 2–4 — server and Stripe

- Server pricing tests: valid line items, invalid IDs/options, quantity bounds, delivery fee/minimum rules, and browser-total tampering.
- Request validation tests: missing/invalid name, phone, email, address, fulfilment choice, and note bounds.
- Stripe test payments: success and failure cards; successful/cancel return routes remain non-authoritative.
- Webhook tests: valid signature, invalid signature, raw-body preservation, missing internal order, repeated event, duplicate checkout completion, and fast acknowledgement.

### Phases 5–7 — dashboard, notifications, launch

- Unauthenticated and non-owner requests are rejected; owner request returns only authorised order data.
- Status transitions create history entries and reject invalid transitions.
- Owner/customer emails are sent only after verified payment and never duplicated on webhook retry.
- Cancellation/refund state tests match owner-approved policy.
- Manual mobile/desktop checkout, accessibility, privacy, production environment, webhook, email, and rollback checks.


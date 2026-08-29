# Technical Decisions

## 2026-08-29 — Preserve the static site and add serverless APIs

**Decision:** Keep the HTML/CSS/JavaScript site and add Vercel Functions for privileged work.

**Why:** The current site is static and has no secure place for Stripe secrets, webhook verification, database access, or owner authorisation. A full framework rewrite would exceed the requested MVP scope and risk existing presentation/functionality.

**Rejected alternative:** Browser-only Stripe/payment logic. It cannot protect secrets, verify webhooks, or calculate trusted prices.

## 2026-08-29 — Server-trusted catalogue and integer-cent pricing

**Decision:** Maintain explicit product/option IDs and price rules on the server; use integer cents for every persisted/calculated amount.

**Why:** HTML display prices and browser totals can be altered by a user. Integer cents avoid floating-point errors and let orders retain historical price snapshots.

**Rejected alternative:** Trusting cart lines, prices, or totals posted by the browser.

## 2026-08-29 — Stripe hosted Checkout in test mode first

**Decision:** Use a server-created Stripe Checkout Session in EUR, with test credentials only until launch approval.

**Why:** It reduces payment-data handling and matches the requested staged rollout. Payment status remains webhook-controlled.

**Rejected alternative:** Custom browser card forms, live-mode development, or treating success-page arrival as paid.

## 2026-08-29 — Proposed Supabase Postgres/Auth and Resend

**Decision:** Propose Supabase for Postgres plus owner authentication/roles, and Resend for transactional email, pending owner confirmation.

**Why:** This provides migrations, role-aware authentication, hosted Postgres, and a focused email API without adding a separate full application server.

**Rejected alternative:** A random dashboard URL or a hard-coded browser password; neither provides adequate authorisation.

## 2026-08-29 — Do not modify application code in Phase 0

**Decision:** Create documentation only and pause before Phase 1.

**Why:** This follows the supplied staged workflow and gives the owner a chance to confirm operational/payment decisions before a cart changes the live site.


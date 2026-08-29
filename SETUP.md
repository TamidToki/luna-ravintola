# Setup Guide (Planned Implementation)

**Status:** No order-system dependencies or environment files exist yet. This guide records the intended setup after approval; it must be updated as implementation choices are finalised.

## Existing site

```bash
npm install
npm start
```

The existing site is static. Its current `start` script runs `npx serve .`; there is no build step.

## Planned environment configuration

Create a local `.env.local` only after Phase 2/3 has introduced the server-side integration. Before doing so, add `.env*` to `.gitignore`; do not commit it. Use Vercel Project Settings → Environment Variables for deployed values.

```dotenv
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...
EMAIL_FROM=orders@your-approved-domain.example
OWNER_NOTIFICATION_EMAIL=owner@example.com
```

Only Stripe **test** keys may be used during development. Keep server-only values out of every browser-delivered file.

## Planned database setup

1. Owner creates/approves a Supabase project, preferably selecting the agreed region and plan.
2. Add the required environment variables locally and in Vercel.
3. Apply versioned SQL in `supabase/migrations/` using the Supabase CLI or Dashboard SQL editor, as documented with the actual migration files.
4. Run the approved menu seed/import after the owner has validated prices, sizes, toppings, and availability.
5. Create the first authenticated owner account and role mapping through a documented, controlled process; never expose a dashboard password in source.

## Planned Stripe test workflow

1. Create a Stripe test-mode account/project and set `STRIPE_SECRET_KEY`.
2. Start a local HTTPS-capable webhook-forwarding session with the Stripe CLI and set its `whsec_...` value in `.env.local`.
3. Use Stripe test cards to exercise success, decline, cancellation, and repeated webhook cases.
4. Deploy a Vercel preview, register its HTTPS webhook endpoint, and test again before production activation.
5. Do not switch to live Stripe keys until Phase 7 approval and the launch checklist are complete.

## Planned deployment process

1. Reconcile local source with the remote production branch and remove the embedded Git credential from the remote URL.
2. Push a reviewed branch and inspect the Vercel preview deployment.
3. Configure non-secret/public and server-only variables in the correct Vercel environments.
4. Confirm `/api/*` functions are not captured by the static-site rewrite.
5. Verify database connectivity, owner authorisation, Stripe webhook signature verification, test payment, idempotency, and notification behaviour.
6. Keep a known-good production deployment available for Vercel rollback.

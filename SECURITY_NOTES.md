# Security Notes

## Current finding — embedded Git credential

During Phase 0, the local Git remote configuration was found to contain an access credential in its URL. Do not copy or reuse it. Revoke/rotate it in GitHub, remove it from the remote URL, and check shell history/CI configuration as appropriate. Use a token-free HTTPS remote or SSH remote going forward.

## Secret handling rules

- Secrets are environment variables configured locally and in Vercel. Before any local secret file is created, add an appropriate `.gitignore` rule for `.env*`; never commit such files.
- Secret values are never displayed in source, browser JavaScript, client-side storage, logs, documentation, or chat.
- Stripe secret and webhook keys, Supabase service-role keys, and email-provider keys remain server-side.
- Browser-visible configuration is limited to genuinely public values such as a Supabase anon key, with database RLS still enforced.

## Payment and order integrity

- The client sends only product/option IDs, quantities, limited notes, fulfilment selection, and customer input; it never supplies an authoritative price.
- Server code validates IDs/options and recalculates totals from trusted catalogue/settings data in integer cents.
- Stripe Checkout Sessions are created only by a server endpoint.
- A success page is not proof of payment. The Stripe webhook verifies the raw payload signature and is the only payment-confirmation authority.
- Webhook event IDs are stored under a unique constraint. Replays must be safe and must not produce duplicate orders, status changes, or emails.

## Access control and privacy

- Owner dashboard APIs require a verified authenticated identity and active `owner`/authorised staff role.
- Addresses, phones, email addresses, payment references, and order notes are never returned by public endpoints or included in client logs.
- Store only fields necessary to fulfil the order. Owner must define retention/deletion policy, access list, privacy notice, and incident contact before launch.
- Use HTTPS in production. Restrict CORS/origin handling to the production and approved preview origins where endpoints require it.

## Open risks

- Delivery rules, refund/cancellation process, tax/VAT treatment, privacy responsibilities, and service providers are unconfirmed.
- Vercel rewrite behaviour must be tested with `/api/*` endpoints in a preview deployment.
- Production readiness cannot be claimed until launch checklist tests pass and the owner approves operational and legal policies.

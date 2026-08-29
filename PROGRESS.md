# Progress Log

## 2026-08-29 — Phase 0: inspection and planning
**Completed**
- Inspected the static-site architecture, menu implementation, deployment configuration, repository state, and public site URLs.
- Confirmed no existing backend/API, database, payment provider, authentication, cart, checkout, or email integration.
- Confirmed menu data is embedded in `index.html`; the UI currently has category tabs, bilingual text, and display prices but no machine-readable product IDs.
- Confirmed the Vercel and custom-domain URLs returned identical HTML during inspection.
- Identified a production-source discrepancy: local `HEAD` is `e846087`, remote `main` is `6cc62bd`, and the supplied deployment screenshot names `6cc62bd`.
- Identified an embedded credential in the local Git remote configuration. It was not used or reproduced; it needs revocation and remote cleanup.
- Created the required planning documentation only. No application files were modified.

**Problems / next step**
- Await approval of `PROJECT_PLAN.md` before Phase 1.
- Owner must confirm operational rules and authoritative source state; see the plan.

## 2026-08-29 — Phase 1: Cart and Order UI
**Completed**
- Parsed `index.html` to create a structured JSON menu in `catalog.js` with unique product IDs, base prices, and sizes.
- Injected `data-item-id` and "Add to Cart" buttons into all menu items in `index.html`.
- Added a responsive Cart Sidebar for viewing items, editing quantities, and viewing the subtotal.
- Added an Item Customization Modal for selecting sizes, adjusting quantities, and leaving special instructions.
- Added extra toppings (+2.00€, +1.00€) and a gluten-free base (+3.00€) options.
- Created the Checkout Form in the sidebar with dynamic Delivery/Takeaway fields.
- Implemented `localStorage` state management in `cart.js`.
- Updated `styles.css` with sleek animations and responsive layouts for the new Cart UI components.

## 2026-08-29 — Phase 2-7: Backend and Integrations (Groundwork)
**Completed**
- **Supabase**: Created `supabase/migrations/01_initial_schema.sql` defining `orders` and `order_items` tables with secure RLS policies.
- **Stripe**: Created Serverless Function `api/create-order.js` to securely calculate totals, add a 5€ delivery fee if applicable, create the order in Supabase, and generate a Stripe Checkout URL.
- **Webhooks**: Created `api/stripe-webhook.js` to securely verify Stripe events and mark orders as `paid` in Supabase.
- **Owner Dashboard**: Created `admin/index.html` and `admin/js/dashboard.js` with a UI to view orders, manually accept them (setting prep time), and mark them ready/completed.
- **Admin APIs**: Created `api/admin/orders.js`, `api/admin/accept-order.js`, and `api/admin/update-status.js`.
- **Success Handling**: Created `success.html` to clear the cart and thank the user, and updated `cart.js` to handle canceled checkouts.

**Problems / next step**
- Awaiting the Supabase and Stripe API keys from the user to verify the backend integration.
- The `node_modules` inside the API might need to be resolved by Vercel on deployment, or we need to ensure local testing works once keys are provided.

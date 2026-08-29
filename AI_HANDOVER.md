# AI Developer Handover Document: Luna Ravintola Online Ordering

This document serves as a comprehensive overview of the architecture, decisions, and current state of the Luna Ravintola online ordering system to quickly onboard any future AI developers or human engineers to the project.

## 1. Project Architecture

The project has transitioned from a purely static HTML/CSS/JS informational website to a hybrid architecture capable of secure e-commerce while preserving the original static speed.

*   **Frontend:** Vanilla HTML, CSS, and JavaScript. No complex frameworks were used in order to maintain the original simplicity and fast loading times.
*   **Hosting / Infrastructure:** Vercel. Vercel serves the static frontend assets and runs the backend logic via Serverless Functions (`/api/`).
*   **Database:** Supabase (PostgreSQL). Used for securely storing order data, customer details, and order statuses.
*   **Payment Processor:** Stripe. Integrated via Stripe Checkout for secure, hosted payment processing.

## 2. Core Components & Logic

### 2.1 The Menu & Pricing (`menu/catalog.js`)
*   **Source of Truth:** Previously, pricing was just text on `index.html`. We created `catalog.js` as a JSON-structured source of truth.
*   **Security:** Both the frontend cart (`cart.js`) and the backend API (`api/create-order.js`) read from `catalog.js`. This prevents malicious users from altering prices in the browser because the backend always recalculates the final total based on the server-side catalog before creating a Stripe session.

### 2.2 The Frontend Cart (`js/cart.js`)
*   **State Management:** Cart state is saved locally in the browser using `localStorage` (`luna_cart`).
*   **Customization:** Supports size selection, quantity adjustment, toppings (+1€ to +2€), gluten-free crusts (+3€), and special notes.
*   **Checkout Flow:**
    1.  User fills out the checkout form (Delivery vs Takeaway toggles address fields).
    2.  `js/cart.js` sends the cart array and customer info to `/api/create-order`.
    3.  If successful, the frontend redirects the user to the returned Stripe Checkout URL.

### 2.3 The Backend API (Vercel Serverless Functions)
*   **`api/create-order.js`**:
    *   Validates the incoming cart.
    *   Recalculates the total (adds a flat `5.00€` delivery fee if the user selected delivery).
    *   Inserts the order into Supabase with a status of `pending`.
    *   Generates a Stripe Checkout Session. The session metadata contains the Supabase `orderId`.
*   **`api/stripe-webhook.js`**:
    *   Listens for the `checkout.session.completed` event from Stripe.
    *   Verifies the cryptographic signature to ensure the payload is genuinely from Stripe.
    *   Updates the corresponding order in Supabase from `pending` to `paid`.

### 2.4 The Owner Dashboard (`admin/index.html` & `admin/js/dashboard.js`)
*   **Purpose:** Allows the restaurant staff to view incoming `paid` orders and manage the kitchen queue.
*   **Logic:**
    *   Fetches orders via `api/admin/orders.js`.
    *   The owner clicks "Accept Order", which triggers `api/admin/accept-order.js`.
    *   This API requires the owner to input a `prepTimeMinutes` (e.g., 15 mins). It calculates the estimated ready time and updates the order status to `preparing`.
    *   The owner can subsequently update the status to `ready` (out for delivery / ready for pickup) and `completed`.

## 3. Database Schema

The initial schema is defined in `supabase/migrations/01_initial_schema.sql`.
*   **`orders` table**: Stores customer info, total amount, delivery type, and `status` (`pending`, `paid`, `preparing`, `ready`, `completed`, `cancelled`).
*   **`order_items` table**: Stores individual items linked to an order, including size, selected toppings, and special notes.
*   **Row Level Security (RLS)**: Is enabled. Currently, anonymous keys can insert, but only the `service_role` key (used by the backend) can update and freely read.

## 4. Pending Features / Next Steps for Future AI

1.  **Email Notifications (Phase 6):** The structural placeholders for sending emails exist in the backend APIs (`accept-order.js` and `update-status.js`), but a provider (like Resend or SendGrid) needs to be integrated to actually send the emails to the customer and owner.
2.  **Dashboard Security:** The `/admin/` route currently relies on basic obscurity. A robust authentication mechanism (like Supabase Auth or a simple password lock) should be implemented to protect the Owner Dashboard.
3.  **Realtime Dashboard Updates:** The dashboard currently uses a basic fetch loop. Supabase Realtime should be initialized in `dashboard.js` so new orders pop up on the screen instantly without needing a page refresh.

## 5. Environment Variables
The system requires the following environment variables to be set in Vercel to function:
*   `SUPABASE_URL`
*   `SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `STRIPE_SECRET_KEY`
*   `STRIPE_WEBHOOK_SECRET`

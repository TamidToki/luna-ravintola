-- Fix RLS: Remove the overly permissive public policies that allow
-- anyone with the anon key to read/write all orders.
-- The backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so no public policies are needed.

DROP POLICY IF EXISTS "Service Role can manage orders" ON orders;
DROP POLICY IF EXISTS "Service Role can manage order_items" ON order_items;

-- Revoke direct access from anon and authenticated roles
REVOKE ALL ON orders FROM anon, authenticated;
REVOKE ALL ON order_items FROM anon, authenticated;

-- Add completed_at timestamp column for history tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

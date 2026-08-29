-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for Order Status
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE order_type AS ENUM ('takeaway', 'delivery');

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    type order_type NOT NULL,
    delivery_address TEXT,
    delivery_apartment TEXT,
    customer_notes TEXT,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount INTEGER NOT NULL, -- in cents
    delivery_fee INTEGER NOT NULL DEFAULT 0, -- in cents
    estimated_ready_time TIMESTAMPTZ,
    stripe_session_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL, -- matches catalog.js id
    item_name_en TEXT NOT NULL,
    item_name_fi TEXT NOT NULL,
    size_id TEXT NOT NULL,
    size_label_en TEXT NOT NULL,
    size_label_fi TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL, -- in cents, includes base price + toppings
    toppings JSONB, -- Array of objects: { id, label, price }
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow Vercel functions (Service Role) full access
CREATE POLICY "Service Role can manage orders" ON orders
    USING (true) WITH CHECK (true);

CREATE POLICY "Service Role can manage order_items" ON order_items
    USING (true) WITH CHECK (true);

-- Trigger to auto-update updated_at on orders
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

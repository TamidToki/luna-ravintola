-- Add the new status to the order_status ENUM
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_delivery' AFTER 'ready';

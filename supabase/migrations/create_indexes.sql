-- Migration: Create database indexes for performance
-- Purpose: Optimize queries on frequently filtered/sorted columns
-- Run in Supabase SQL Editor

-- Index on products.category for product filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Index on orders.status for order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Composite index on orders(status, created_at) for status + date range queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Index on orders.created_at for date filtering and sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Index on customers.email for customer lookup
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Index on admin_users.email for admin login
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Verify indexes were created
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

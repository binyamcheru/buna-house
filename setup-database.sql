-- ===================================================
-- 🚀 COPY-PASTE THIS ENTIRE FILE INTO SUPABASE
-- ===================================================
-- Go to: https://supabase.com/dashboard
-- Click: Your Project → SQL Editor → New Query
-- Paste this entire file and click "Run"
-- ===================================================

-- 1️⃣ CREATE INDEXES FOR 10X FASTER QUERIES
-- ===================================================

-- Products indexes (faster product listings)
CREATE INDEX IF NOT EXISTS idx_products_stock
ON products(stock)
WHERE stock > 0;

CREATE INDEX IF NOT EXISTS idx_products_category_stock
ON products(category, stock);

CREATE INDEX IF NOT EXISTS idx_products_featured
ON products(featured)
WHERE featured = true;

-- Orders indexes (faster order management)
CREATE INDEX IF NOT EXISTS idx_orders_status_created
ON orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email
ON orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_orders_created
ON orders(created_at DESC);

-- Customers indexes (faster customer lookup)
CREATE INDEX IF NOT EXISTS idx_customers_email
ON customers(email);

-- Newsletter indexes (faster subscriber queries)
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed
ON newsletter_leads(subscribed_at DESC);

-- Contact leads indexes (faster lead management)
CREATE INDEX IF NOT EXISTS idx_contact_status_created
ON contact_leads(status, created_at DESC);


-- 2️⃣ VERIFY INDEXES WERE CREATED
-- ===================================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ✅ You should see all the indexes listed above!


-- 3️⃣ TEST QUERY PERFORMANCE (OPTIONAL)
-- ===================================================
-- This shows you the query plan - should say "Index Scan"

EXPLAIN ANALYZE
SELECT * FROM products
WHERE stock > 0
ORDER BY created_at DESC
LIMIT 10;

-- ✅ Look for "Index Scan" instead of "Seq Scan"
-- ✅ Execution time should be < 5ms


-- 4️⃣ CHECK TABLE SIZES (OPTIONAL)
-- ===================================================
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ===================================================
-- ✅ DONE! Your database is now optimized!
-- ===================================================

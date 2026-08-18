-- ============================================================
-- Buna House Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Admin Users Table (for authentication)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_city TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Newsletter Leads Table
CREATE TABLE newsletter_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Contact Leads Table
CREATE TABLE contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Indexes for Performance
-- ============================================================

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_contact_leads_status ON contact_leads(status);

-- ============================================================
-- Insert Default Admin User
-- Password: admin123 (hashed with bcrypt)
-- ============================================================

INSERT INTO admin_users (email, password_hash, name) VALUES
('admin@bunahouse.et', '$2a$10$rKZO8qH8qH8qH8qH8qH8qO8qH8qH8qH8qH8qH8qH8qH8qH8qH8qHe', 'Admin User');

-- Note: The password hash above is a placeholder
-- We'll properly hash the password through the API when creating admin users

-- ============================================================
-- Sample Data (Optional - for testing)
-- ============================================================

-- Sample Products
INSERT INTO products (name, description, price, category, image, stock, featured) VALUES
('Ethiopian Yirgacheffe', 'Floral notes with bright citrus acidity', 2500.00, 'Coffee', '/uploads/products/product-1787058979628.jpg', 50, true),
('Colombian Supremo', 'Smooth, well-balanced with caramel sweetness', 2200.00, 'Coffee', '/uploads/products/product-1787059190847.jpg', 45, true),
('House Blend', 'Our signature blend - smooth and balanced', 1800.00, 'Coffee', '/uploads/products/product-1787059468682.jpg', 100, true),
('Espresso Blend', 'Rich and bold, perfect for espresso', 2000.00, 'Coffee', '/uploads/products/product-1787084962153.jpg', 80, false);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, only service role can write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Orders: Anyone can insert (customer placing order), only service role can update/delete
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Newsletter: Anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_leads FOR INSERT
  WITH CHECK (true);

-- Contact: Anyone can submit contact form
CREATE POLICY "Anyone can submit contact form"

  ON contact_leads FOR INSERT
  WITH CHECK (true);

-- Admin tables: Only accessible via service role (no public policies)
-- This means only backend APIs with service role key can access admin_users, customers, etc.

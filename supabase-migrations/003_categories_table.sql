-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ordering and active status
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Insert default categories (matches the taxonomy used in the admin product form)
INSERT INTO categories (name, slug, display_order, is_active) VALUES
  ('Coffee', 'coffee', 1, true),
  ('Cappuccino', 'cappuccino', 2, true),
  ('Latte', 'latte', 3, true),
  ('Iced Coffee', 'iced-coffee', 4, true),
  ('Mocktails', 'mocktails', 5, true),
  ('Tea', 'tea', 6, true),
  ('Shakes', 'shakes', 7, true),
  ('Desserts', 'desserts', 8, true),
  ('Snacks', 'snacks', 9, true),
  ('Combos', 'combos', 10, true)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Add comment
COMMENT ON TABLE categories IS 'Product categories with custom ordering for display';

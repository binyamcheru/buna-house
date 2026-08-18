-- Hero Images Table
CREATE TABLE IF NOT EXISTS hero_images (
  id SERIAL PRIMARY KEY,
  label VARCHAR(100),
  title VARCHAR(255),
  subtitle TEXT,
  image_url TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default hero slides
INSERT INTO hero_images (label, title, subtitle, image_url, display_order, is_active) VALUES
('✦ Crafted Fresh', 'Your Daily Ritual, Elevated.',
  'Small-batch roasts pulled to order and poured for you — in the heart of Bole.',
  '/uploads/hero/hero-1787056660298.jpg', 1, true),
('✦ Local Beans', 'From Roast to Ritual.',
  'Single-origin beans, roasted in-house every week for depth you can taste.',
  '/uploads/hero/hero-1787222343806.jpg', 2, true),
('✦ Chilled & Ready', 'Cool Down, Lift Up.',
  'Slow-steeped cold brew and iced classics, made for Addis Ababa summers.',
  '/uploads/hero/hero-1787222455214.jpg', 3, true),
('✦ Loved Locally', 'Rated 4.9 by 2,000+ Coffee Lovers.',
  'Join the ritual — order ahead, skip the queue and earn rewards.',
  '/uploads/hero/hero-1787222654223.jpg', 4, true)
ON CONFLICT (image_url) DO UPDATE SET
  label = EXCLUDED.label,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle;

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('address', '{
  "name": "Buna House",
  "street": "Bole Road, near Dembel City Center,",
  "area": "Bole, Addis Ababa"
}'::jsonb),
('hours', '{
  "weekdays": "Monday – Friday: 8:00am – 11:00pm",
  "weekends": "Saturday – Sunday: 9:00am – 12:00am"
}'::jsonb),
('contact', '{
  "phone": "+251 11 662 3348",
  "email": "hello@bunahouse.et",
  "telegram": "BunaHouseAddis"
}'::jsonb),
('delivery', '{
  "minimum": "1,500",
  "time": "30–45 minutes",
  "areas": "Bole, CMC and Megenagna"
}'::jsonb),
('promo_bar', '{
  "messages": [
    "RATED 4.9 BY 2,000+ COFFEE LOVERS ✦",
    "FLAT 20% OFF ON YOUR FIRST ORDER",
    "ORDER NOW"
  ]
}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Indexes
CREATE INDEX idx_hero_images_active ON hero_images(is_active, display_order);
CREATE INDEX idx_site_settings_key ON site_settings(setting_key);

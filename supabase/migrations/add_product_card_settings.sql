-- Add product card customization settings
-- Run this in Supabase SQL Editor

INSERT INTO site_settings (setting_key, setting_value) VALUES
('product_card', '{
  "sizes": ["Small", "Medium", "Large"],
  "type": "instructions",
  "instructions_label": "Special Instructions",
  "instructions_placeholder": "Any special requests? (e.g., less sugar, extra hot)"
}')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value;

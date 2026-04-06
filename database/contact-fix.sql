-- Allmate contact/email fix for existing databases
-- 1) Ensure contact_messages table exists
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(40),
  subject VARCHAR(160),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Update visible/public contact email in CMS settings
UPDATE site_settings
SET setting_value = 'contacto@allmate.cl',
    updated_at = CURRENT_TIMESTAMP
WHERE setting_key = 'site_email';

-- 3) Fallback insert if site_email setting does not exist yet
INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public)
SELECT 'site_email', 'contacto@allmate.cl', 'contacto', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE setting_key = 'site_email'
);

-- 4) Optional audit: check if any old esterospa email remains in public settings
-- SELECT * FROM site_settings WHERE setting_value ILIKE '%esterospa.cl%';

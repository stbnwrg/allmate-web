BEGIN;

CREATE TABLE IF NOT EXISTS cms_pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 100,
  seo_title TEXT,
  seo_description TEXT,
  seo_canonical TEXT,
  seo_robots VARCHAR(120),
  schema_type VARCHAR(120),
  schema_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  section_key VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  layout_type VARCHAR(120) DEFAULT 'default',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 100,
  seo_title TEXT,
  seo_description TEXT,
  seo_canonical TEXT,
  seo_robots VARCHAR(120),
  schema_type VARCHAR(120),
  schema_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_id, section_key)
);

CREATE TABLE IF NOT EXISTS cms_items (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES cms_sections(id) ON DELETE CASCADE,
  item_key VARCHAR(160),
  title TEXT,
  subtitle TEXT,
  content TEXT,
  button_label VARCHAR(160),
  button_url TEXT,
  tag VARCHAR(160),
  price INTEGER,
  old_price INTEGER,
  badge VARCHAR(160),
  image_url TEXT,
  image_alt TEXT,
  icon VARCHAR(120),
  extra_json JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_media (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(80),
  alt_text TEXT,
  title TEXT,
  folder VARCHAR(160),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(160) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_group VARCHAR(160) DEFAULT 'general',
  is_public BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_sections_page_sort ON cms_sections(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_items_section_sort ON cms_items(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_settings_group ON site_settings(setting_group);

COMMIT;

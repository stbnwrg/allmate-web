-- Fase 3 limpia: conectar solo textos de productos y bloque de repuestos al CMS.
-- No toca la grilla visual de motos ni sus tarjetas; solo el copy del encabezado y repuestos.

INSERT INTO cms_sections (
  page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order
)
SELECT
  p.id,
  'intro',
  'Catálogo',
  'Motos KAYO en Concepción y Biobío',
  'Catálogo',
  'Un catálogo pensado para búsquedas transaccionales como motos KAYO Biobío, enduro KAYO en Concepción, pit bike KAYO zona sur y ATV KAYO bajo pedido desde Coronel.',
  'hero',
  TRUE,
  10
FROM cms_pages p
WHERE p.slug = 'productos'
ON CONFLICT (page_id, section_key)
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  layout_type = EXCLUDED.layout_type,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO cms_sections (
  page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order
)
SELECT
  p.id,
  'repuestos',
  'Repuestos y cotización',
  'Solicita repuestos KAYO con datos claros',
  'Formulario pensado para repuestos KAYO en Biobío, consultas por modelo, piezas específicas y necesidades de clientes desde Coronel al Gran Concepción.',
  '<p>Atendemos consultas de repuestos KAYO para Coronel, Concepción y toda la Región del Biobío. Puedes enviar foto, año, versión, medida o número de pieza para acelerar la cotización.</p>',
  'form',
  TRUE,
  30
FROM cms_pages p
WHERE p.slug = 'productos'
ON CONFLICT (page_id, section_key)
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  layout_type = EXCLUDED.layout_type,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- Fase 3 corregida v2: contenido CMS para productos y repuestos

INSERT INTO cms_sections (page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order)
SELECT p.id,
       'intro',
       'Intro productos',
       'Motos KAYO en Concepción y Biobío',
       'MOTOS',
       'La parte superior de esta página se enfoca en motos. Si una ficha todavía no tiene imagen, quedará vacía hasta que cargues la foto correcta.',
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
  sort_order = EXCLUDED.sort_order;

INSERT INTO cms_sections (page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order)
SELECT p.id,
       'repuestos',
       'Bloque repuestos',
       'Cotiza repuestos KAYO en Biobío',
       'Déjanos el modelo de moto, tus datos y la información más útil para identificar la pieza correcta y responderte rápido.',
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
  sort_order = EXCLUDED.sort_order;

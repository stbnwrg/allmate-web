-- Allmate Motors - CMS seed full
-- Requisitos previos:
-- 1) database/schema.sql aplicado
-- 2) database/cms-schema.sql aplicado
-- 3) Este archivo NO reemplaza database/seed-productos.sql
-- 4) Se puede ejecutar más de una vez; actualiza páginas, secciones, noticias y settings.

BEGIN;

/* -------------------------------------------------------------------------- */
/* 1) PÁGINAS CMS                                                              */
/* -------------------------------------------------------------------------- */
INSERT INTO cms_pages (
  slug,
  name,
  description,
  is_active,
  sort_order,
  seo_title,
  seo_description,
  seo_canonical,
  seo_robots,
  schema_type,
  schema_json
)
VALUES
(
  'index',
  'Inicio',
  'Portada principal de Allmate Motors.',
  TRUE,
  10,
  'Distribuidor oficial KAYO en Concepción y Biobío | Allmate Motors',
  'Allmate Motors, distribuidor oficial KAYO en Coronel con cobertura comercial para Concepción, Gran Concepción y toda la Región del Biobío.',
  NULL,
  'index,follow',
  'MotorcycleDealer',
  '{"@context":"https://schema.org","@type":"MotorcycleDealer"}'::jsonb
),
(
  'productos',
  'Productos',
  'Catálogo principal de motos KAYO y formulario de repuestos.',
  TRUE,
  20,
  'Motos KAYO en Concepción y Biobío | Allmate Motors',
  'Catálogo KAYO con modelos enduro, pit bike, mini y línea ATV/UTV, más formulario de repuestos para Coronel, Concepción y Biobío.',
  NULL,
  'index,follow',
  'CollectionPage',
  '{"@context":"https://schema.org","@type":"CollectionPage"}'::jsonb
),
(
  'ofertas',
  'Ofertas',
  'Página comercial para promociones, oportunidades y modelos destacados.',
  TRUE,
  30,
  'Ofertas KAYO en Biobío | Allmate Motors',
  'Ofertas activas, modelos destacados y oportunidades comerciales de Allmate Motors para búsquedas transaccionales en Biobío.',
  NULL,
  'index,follow',
  'CollectionPage',
  '{"@context":"https://schema.org","@type":"CollectionPage"}'::jsonb
),
(
  'news',
  'News',
  'Noticias, lanzamientos y contenido editorial de Allmate Motors.',
  TRUE,
  40,
  'Noticias KAYO y Allmate en Biobío | Allmate Motors',
  'Noticias, avances de catálogo, cobertura comercial y contenido local de Allmate Motors para reforzar búsquedas de marca y motos KAYO en Concepción y Biobío.',
  NULL,
  'index,follow',
  'Blog',
  '{"@context":"https://schema.org","@type":"Blog"}'::jsonb
),
(
  'contacto',
  'Contacto',
  'Canales de contacto, ubicación y formulario comercial.',
  TRUE,
  50,
  'Contacto Allmate Motors | KAYO en Coronel, Concepción y Biobío',
  'Contacto directo, ubicación, WhatsApp, Instagram y formulario comercial de Allmate Motors.',
  NULL,
  'index,follow',
  'ContactPage',
  '{"@context":"https://schema.org","@type":"ContactPage"}'::jsonb
)
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_canonical = EXCLUDED.seo_canonical,
  seo_robots = EXCLUDED.seo_robots,
  schema_type = EXCLUDED.schema_type,
  schema_json = EXCLUDED.schema_json,
  updated_at = CURRENT_TIMESTAMP;

/* -------------------------------------------------------------------------- */
/* 2) SECCIONES CMS                                                            */
/* -------------------------------------------------------------------------- */
INSERT INTO cms_sections (
  page_id,
  section_key,
  name,
  title,
  subtitle,
  content,
  layout_type,
  is_active,
  sort_order,
  seo_title,
  seo_description,
  seo_canonical,
  seo_robots,
  schema_type,
  schema_json
)
SELECT
  p.id,
  v.section_key,
  v.name,
  v.title,
  v.subtitle,
  v.content,
  v.layout_type,
  TRUE,
  v.sort_order,
  v.seo_title,
  v.seo_description,
  NULL,
  'index,follow',
  v.schema_type,
  v.schema_json
FROM cms_pages p
JOIN (
  VALUES
  ('index', 'hero', 'Hero', 'Distribuidor oficial KAYO en Concepción y la Región del Biobío', 'Motos, repuestos, pit bike, enduro y línea ATV/UTV con atención directa desde Coronel.', 'Allmate Motors opera desde Coronel con cobertura específica hacia el Gran Concepción y toda la Región del Biobío.', 'hero', 10, 'Distribuidor oficial KAYO en Concepción y la Región del Biobío', 'Hero principal de la portada de Allmate Motors con foco en catálogo, repuestos y cobertura local.', 'MotorcycleDealer', '{"@context":"https://schema.org","@type":"MotorcycleDealer"}'::jsonb),
  ('index', 'categorias', 'Categorías', 'Líneas KAYO y formatos de uso', 'Una vitrina ordenada para que el visitante entienda rápido qué vende Allmate y hacia dónde debe avanzar.', 'Cada bloque de categoría busca capturar intención local real: enduro, pit bike, iniciación y repuestos.', 'cards', 20, 'Líneas KAYO y formatos de uso', 'Sección de categorías comerciales del home de Allmate Motors.', 'ItemList', '{"@context":"https://schema.org","@type":"ItemList"}'::jsonb),
  ('index', 'ofertas_home', 'Ofertas de la semana', 'Modelos KAYO con mejor tracción comercial esta semana', 'Ofertas destacadas para búsquedas transaccionales en Concepción, Coronel y Biobío.', 'Tarjetas visibles con imagen, precio, descripción y acceso a la sección de ofertas.', 'carousel', 30, 'Ofertas destacadas KAYO en Biobío', 'Bloque destacado de ofertas y modelos con mejor tracción comercial en el home.', 'ItemList', '{"@context":"https://schema.org","@type":"ItemList"}'::jsonb),
  ('index', 'quienes_somos', 'Quiénes somos', 'Allmate no vende humo: vende motos con carácter y respuesta rápida.', 'Distribuidor oficial de KAYO en la Región del Biobío, con cobertura específica desde Coronel al Gran Concepción y toda la región.', 'La propuesta mezcla motos de gama media, repuestos, soporte local y una operación comercial pensada para convertir consultas en ventas reales.', 'split', 40, 'Quiénes somos | Allmate Motors', 'Bloque institucional y comercial de Allmate Motors.', 'AboutPage', '{"@context":"https://schema.org","@type":"AboutPage"}'::jsonb),
  ('index', 'carrusel_visual', 'Carrusel visual', 'Comunidad, pista y contenido local', 'Bloque visual para reforzar marca, comunidad y estilo off-road.', 'Imágenes reales de la comunidad y del entorno KAYO con enfoque editorial y comercial.', 'marquee', 50, 'Comunidad y pista | Allmate Motors', 'Carrusel visual de comunidad, pista y contenido local.', 'ImageGallery', '{"@context":"https://schema.org","@type":"ImageGallery"}'::jsonb),
  ('index', 'contacto_ubicacion', 'Contacto y ubicación', 'Atención directa, sin laberintos.', 'Canales visibles, mapa, Instagram y WhatsApp con acceso rápido para que el visitante pase de mirar a escribir.', 'Atención coordinada desde Coronel con foco comercial en Concepción y Región del Biobío.', 'contact', 60, 'Contacto y ubicación | Allmate Motors', 'Bloque de contacto rápido y ubicación del home.', 'ContactPage', '{"@context":"https://schema.org","@type":"ContactPage"}'::jsonb),
  ('productos', 'intro', 'Catálogo', 'Motos KAYO en Concepción y Biobío', 'Catálogo', 'Un catálogo pensado para búsquedas transaccionales como motos KAYO Biobío, enduro KAYO en Concepción, pit bike KAYO zona sur y ATV KAYO bajo pedido desde Coronel.', 'hero', 10, 'Catálogo KAYO en Concepción y Biobío', 'Introducción SEO/comercial del catálogo de productos.', 'CollectionPage', '{"@context":"https://schema.org","@type":"CollectionPage"}'::jsonb),
  ('productos', 'repuestos', 'Repuestos y cotización', 'Solicita repuestos KAYO con datos claros', 'Formulario pensado para repuestos KAYO en Biobío, consultas por modelo, piezas específicas y necesidades de clientes desde Coronel al Gran Concepción.', '<p>Atendemos consultas de repuestos KAYO para Coronel, Concepción y toda la Región del Biobío. Puedes enviar foto, año, versión, medida o número de pieza para acelerar la cotización.</p>', 'form', 30, 'Repuestos KAYO en Biobío | Allmate Motors', 'Bloque de formulario y conversión para repuestos KAYO.', 'ContactPage', '{"@context":"https://schema.org","@type":"ContactPage"}'::jsonb),
  ('ofertas', 'hero', 'Ofertas', 'Ofertas KAYO en Concepción y Biobío', 'Promociones activas y modelos disponibles', 'Encuentra motos KAYO en oferta en Coronel, Concepción y toda la Región del Biobío.', 'hero', 10, 'Ofertas KAYO en Concepción y Biobío', 'Hero comercial de la página de ofertas.', 'CollectionPage', '{"@context":"https://schema.org","@type":"CollectionPage"}'::jsonb),
  ('news', 'intro', 'News', 'Contenido local para reforzar marca, catálogo y búsquedas long-tail', 'Noticias pensadas para consolidar señales de marca, cobertura local y contenido útil alrededor de motos KAYO, catálogo, repuestos y operación comercial en Biobío.', 'Cada noticia abre una página completa con más imágenes, desarrollo editorial y contexto local para fortalecer la marca Allmate Motors en Google.', 'news-hero', 10, 'Noticias KAYO en Concepción y Biobío', 'Bloque editorial de portada para la sección de noticias.', 'Blog', '{"@context":"https://schema.org","@type":"Blog"}'::jsonb),
  ('contacto', 'contacto', 'Contacto', 'Contáctanos', 'Estamos listos para ayudarte', 'Escríbenos para cotizar motos KAYO, repuestos o resolver cualquier duda.', 'form', 10, 'Contacto Allmate Motors', 'Bloque base de contacto y captura comercial.', 'ContactPage', '{"@context":"https://schema.org","@type":"ContactPage"}'::jsonb)
) AS v(page_slug, section_key, name, title, subtitle, content, layout_type, sort_order, seo_title, seo_description, schema_type, schema_json)
  ON p.slug = v.page_slug
ON CONFLICT (page_id, section_key)
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  layout_type = EXCLUDED.layout_type,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_canonical = EXCLUDED.seo_canonical,
  seo_robots = EXCLUDED.seo_robots,
  schema_type = EXCLUDED.schema_type,
  schema_json = EXCLUDED.schema_json,
  updated_at = CURRENT_TIMESTAMP;

/* -------------------------------------------------------------------------- */
/* 3) ITEMS CMS - HERO HOME                                                    */
/* -------------------------------------------------------------------------- */
WITH target AS (
  SELECT cs.id AS section_id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'hero'
), deleted AS (
  DELETE FROM cms_items ci
  USING target t
  WHERE ci.section_id = t.section_id
    AND ci.item_key IN ('slide-1','strip-2','strip-3','strip-4')
)
INSERT INTO cms_items (
  section_id, item_key, title, subtitle, content,
  button_label, button_url, tag, image_url, image_alt, is_active, sort_order
)
SELECT
  t.section_id,
  v.item_key,
  v.title,
  v.subtitle,
  v.content,
  v.button_label,
  v.button_url,
  v.tag,
  v.image_url,
  v.image_alt,
  TRUE,
  v.sort_order
FROM target t
CROSS JOIN (
  VALUES
  ('slide-1', 'Motos KAYO, repuestos y ofertas con atención directa en la zona sur.', 'Catálogo comercial con foco en Coronel, Concepción y la Región del Biobío.', 'El home ya puede leer desde CMS el título, subtítulo, CTA y la imagen principal del hero.', 'Ver catálogo KAYO', 'productos.html', '01', '/images/hero/hero-1.jpeg', 'Hero Allmate Motors con KAYO en Biobío', 10),
  ('strip-2', 'Ofertas y repuestos', 'Modelos destacados y cotización rápida de partes.', 'Bloque corto para reforzar intención comercial.', NULL, NULL, '02', NULL, NULL, 20),
  ('strip-3', 'Cobertura Biobío', 'Coronel, Concepción y el Gran Concepción.', 'Bloque corto para reforzar intención local.', NULL, NULL, '03', NULL, NULL, 30),
  ('strip-4', 'Contacto sin laberintos', 'WhatsApp, mapa, Instagram y formularios claros.', 'Bloque corto para reforzar acción comercial.', NULL, NULL, '04', NULL, NULL, 40)
) AS v(item_key, title, subtitle, content, button_label, button_url, tag, image_url, image_alt, sort_order);

/* -------------------------------------------------------------------------- */
/* 4) ITEMS CMS - CATEGORÍAS HOME                                              */
/* -------------------------------------------------------------------------- */
WITH target AS (
  SELECT cs.id AS section_id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'categorias'
), deleted AS (
  DELETE FROM cms_items ci
  USING target t
  WHERE ci.section_id = t.section_id
    AND ci.item_key IN ('enduro','pit-bike','iniciacion','repuestos')
)
INSERT INTO cms_items (
  section_id, item_key, title, subtitle, content,
  button_label, button_url, tag, image_url, image_alt, is_active, sort_order
)
SELECT
  t.section_id,
  v.item_key,
  v.title,
  v.subtitle,
  v.content,
  v.button_label,
  v.button_url,
  v.tag,
  v.image_url,
  v.image_alt,
  TRUE,
  v.sort_order
FROM target t
CROSS JOIN (
  VALUES
  ('enduro', 'Enduro y nivel medio', 'Motos enduro KAYO en Concepción y Biobío.', 'Modelos para trail, iniciación seria y riders que buscan una moto enduro KAYO con atención local.', 'Ver modelos', 'productos.html#enduro', 'DIRT BIKE / ENDURO', '/images/productos/t4-250/t4-250-1.jpg', 'Moto enduro KAYO T4 250 en Biobío', 10),
  ('pit-bike', 'Compactas y progresión', 'Pit bike KAYO para práctica y progresión.', 'Motos para entrar al mundo KAYO, practicar, progresar y captar búsquedas de pit bike en Biobío.', 'Ver pit bike', 'productos.html#pit-bike', 'PIT BIKE', '/images/productos/tt160/tt160-1.jpg', 'Pit bike KAYO TT160 en Concepción', 20),
  ('iniciacion', 'Iniciación y ATV / UTV', 'Línea de iniciación, mini y ATV / UTV KAYO.', 'Línea de iniciación, entretenimiento y búsqueda comercial para quienes quieren ATV/UTV KAYO bajo pedido.', 'Ver iniciación', 'productos.html#atv-utv', 'ATV / UTV', '/images/hero/hero-1.jpeg', 'ATV KAYO en Biobío', 30),
  ('repuestos', 'Repuestos y soporte real', 'Cotización rápida de repuestos KAYO.', 'Cotización rápida para identificar la pieza correcta y convertir una necesidad técnica en una venta ordenada.', 'Cotizar repuesto', 'productos.html#repuestos', 'REPUESTOS', '/images/branding/logo-secundario.jpeg', 'Repuestos KAYO en Coronel', 40)
) AS v(item_key, title, subtitle, content, button_label, button_url, tag, image_url, image_alt, sort_order);

/* -------------------------------------------------------------------------- */
/* 5) ITEMS CMS - QUIÉNES SOMOS                                                */
/* -------------------------------------------------------------------------- */
WITH target AS (
  SELECT cs.id AS section_id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'quienes_somos'
), deleted AS (
  DELETE FROM cms_items ci
  USING target t
  WHERE ci.section_id = t.section_id
    AND ci.item_key IN ('foco-comercial','estetica-offroad','sucursal-cobertura')
)
INSERT INTO cms_items (
  section_id, item_key, title, content, tag, is_active, sort_order
)
SELECT
  t.section_id,
  v.item_key,
  v.title,
  v.content,
  v.tag,
  TRUE,
  v.sort_order
FROM target t
CROSS JOIN (
  VALUES
  ('foco-comercial', 'Foco comercial', 'Catálogo ordenado, fichas individuales, ofertas visibles y CTA pensados para capturar búsquedas locales y convertirlas en consultas reales.', '01', 10),
  ('estetica-offroad', 'Estética off-road', 'Contenido visual con look KAYO, lenguaje de zona sur y enfoque en categorías que sí responden a lo que busca el cliente.', '02', 20),
  ('sucursal-cobertura', 'Sucursal y cobertura', 'Calle Corcovado #991, Cerro Santa Elena, Coronel. Cobertura desde Coronel al Gran Concepción y toda la Región del Biobío.', '03', 30)
) AS v(item_key, title, content, tag, sort_order);

/* -------------------------------------------------------------------------- */
/* 6) ITEMS CMS - CARRUSEL VISUAL                                              */
/* -------------------------------------------------------------------------- */
WITH target AS (
  SELECT cs.id AS section_id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'carrusel_visual'
), deleted AS (
  DELETE FROM cms_items ci
  USING target t
  WHERE ci.section_id = t.section_id
    AND ci.item_key IN ('carrusel-1','carrusel-2','carrusel-3')
)
INSERT INTO cms_items (
  section_id, item_key, title, subtitle, content,
  tag, image_url, image_alt, is_active, sort_order
)
SELECT
  t.section_id,
  v.item_key,
  v.title,
  v.subtitle,
  v.content,
  v.tag,
  v.image_url,
  v.image_alt,
  TRUE,
  v.sort_order
FROM target t
CROSS JOIN (
  VALUES
  ('carrusel-1', 'Comunidad KAYO Biobío', 'Pilotos y actividad real en la zona sur.', 'Imagen editorial para reforzar marca y comunidad.', 'EDITORIAL', '/images/carrusel/allmate-kayo-biobio-enduro-01.webp', 'Comunidad KAYO en Biobío', 10),
  ('carrusel-2', 'Entrenamiento y progresión', 'Pista, barro y aprendizaje local.', 'Imagen visual para reforzar búsquedas long-tail.', 'ENDURO', '/images/carrusel/allmate-kayo-biobio-dirt-track-02.webp', 'Entrenamiento KAYO en Concepción', 20),
  ('carrusel-3', 'Contenido local de marca', 'Visuales para reforzar presencia regional.', 'Imagen visual para reforzar marca y catálogo.', 'MARCA', '/images/carrusel/allmate-kayo-biobio-community-04.webp', 'Contenido local Allmate Motors', 30)
) AS v(item_key, title, subtitle, content, tag, image_url, image_alt, sort_order);

/* -------------------------------------------------------------------------- */
/* 7) ITEMS CMS - CONTACTO / UBICACIÓN HOME                                    */
/* -------------------------------------------------------------------------- */
WITH target AS (
  SELECT cs.id AS section_id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'contacto_ubicacion'
), deleted AS (
  DELETE FROM cms_items ci
  USING target t
  WHERE ci.section_id = t.section_id
    AND ci.item_key IN ('whatsapp','correo','direccion','instagram')
)
INSERT INTO cms_items (
  section_id, item_key, title, content,
  button_label, button_url, icon, is_active, sort_order
)
SELECT
  t.section_id,
  v.item_key,
  v.title,
  v.content,
  v.button_label,
  v.button_url,
  v.icon,
  TRUE,
  v.sort_order
FROM target t
CROSS JOIN (
  VALUES
  ('whatsapp', 'WhatsApp', '+56 9 9217 8719', 'Escribir ahora', 'https://wa.me/56992178719', 'whatsapp', 10),
  ('correo', 'Correo', 'contacto@allmate.cl', 'Enviar correo', 'mailto:contacto@allmate.cl', 'mail', 20),
  ('direccion', 'Dirección', 'Calle Corcovado #991, Cerro Santa Elena, Coronel', 'Ver mapa', 'https://maps.app.goo.gl/Qd9GY7afANL3JM3a6', 'map-pin', 30),
  ('instagram', 'Instagram', '@allmatemotors.cl', 'Ver Instagram', 'https://instagram.com/allmatemotors.cl', 'instagram', 40)
) AS v(item_key, title, content, button_label, button_url, icon, sort_order);

/* -------------------------------------------------------------------------- */
/* 8) SETTINGS GLOBALES                                                        */
/* -------------------------------------------------------------------------- */
INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public)
VALUES
('business_name', 'Allmate Motors', 'branding', TRUE),
('business_tagline', 'Distribuidor oficial KAYO', 'branding', TRUE),
('site_phone', '+56 9 9217 8719', 'contacto', TRUE),
('site_whatsapp', 'https://wa.me/56992178719', 'contacto', TRUE),
('site_whatsapp_label', '+56 9 9217 8719', 'contacto', TRUE),
('site_email', 'contacto@allmate.cl', 'contacto', TRUE),
('site_instagram', 'https://instagram.com/allmatemotors.cl', 'contacto', TRUE),
('site_instagram_label', '@allmatemotors.cl', 'contacto', TRUE),
('site_address', 'Calle Corcovado #991, Cerro Santa Elena, Coronel', 'contacto', TRUE),
('site_region', 'Región del Biobío', 'contacto', TRUE),
('google_maps_embed', 'https://www.google.com/maps?q=Calle%20Corcovado%20991%20Coronel&output=embed', 'contacto', TRUE),
('google_maps_link', 'https://maps.app.goo.gl/Qd9GY7afANL3JM3a6', 'contacto', TRUE),
('footer_text', 'Distribuidor oficial de KAYO en la Región del Biobío, con cobertura específica desde Coronel al Gran Concepción y toda la región.', 'footer', TRUE)
ON CONFLICT (setting_key)
DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  setting_group = EXCLUDED.setting_group,
  is_public = EXCLUDED.is_public,
  updated_at = CURRENT_TIMESTAMP;

/* -------------------------------------------------------------------------- */
/* 9) NEWS BASE                                                                */
/* -------------------------------------------------------------------------- */
INSERT INTO news (
  title,
  slug,
  excerpt,
  content,
  image_url,
  author,
  published_at,
  is_active,
  seo_title,
  seo_description,
  seo_canonical,
  seo_robots,
  schema_type,
  schema_json
)
VALUES
(
  'Allmate Motors fortalece su vitrina KAYO en Biobío',
  'allmate-motors-fortalece-su-vitrina-kayo-en-biobio',
  'La vitrina digital evoluciona para mostrar catálogo, ofertas, repuestos y contacto directo desde Coronel.',
  $$<p>Allmate Motors sigue fortaleciendo su presencia digital en la Región del Biobío con una vitrina enfocada en motos KAYO, repuestos, ofertas y contacto directo.</p>
  <p>El objetivo es claro: facilitar la búsqueda de modelos enduro, pit bike, mini y ATV / UTV para clientes de Coronel, Concepción y el Gran Concepción, sin perder foco comercial ni velocidad de respuesta.</p>
  <img src="/images/carrusel/allmate-kayo-biobio-enduro-01.webp" alt="Allmate Motors fortalece su vitrina KAYO en Biobío">
  <p>La nueva estructura refuerza categorías, productos, noticias y formularios de repuestos, creando una base sólida para crecer en visibilidad orgánica y conversiones.</p>$$,
  '/images/carrusel/allmate-kayo-biobio-enduro-01.webp',
  'Allmate Motors',
  '2025-12-14 10:00:00',
  TRUE,
  'Allmate Motors fortalece su vitrina KAYO en Biobío | News',
  'La vitrina digital de Allmate Motors evoluciona para mostrar catálogo, ofertas, repuestos y contacto directo desde Coronel.',
  NULL,
  'index,follow',
  'Article',
  '{"@context":"https://schema.org","@type":"Article"}'::jsonb
),
(
  'Nueva estructura de catálogo para enduro, pit bike y mini',
  'nueva-estructura-de-catalogo-para-enduro-pit-bike-y-mini',
  'La página se reorganiza por familias para facilitar la búsqueda de motos, fichas técnicas y repuestos.',
  $$<p>La estructura de catálogo de Allmate Motors fue reorganizada para que el visitante entienda rápido qué vende la marca y hacia dónde debe avanzar.</p>
  <p>Con esta mejora, las familias KAYO para enduro, pit bike, mini e iniciación ATV / UTV quedan más claras tanto para el usuario como para buscadores.</p>
  <img src="/images/carrusel/allmate-kayo-biobio-enduro-action-03.webp" alt="Nueva estructura de catálogo KAYO Allmate Motors">
  <p>La reorganización también deja mejor preparada la web para trabajar búsquedas long-tail y fichas individuales por producto.</p>$$,
  '/images/carrusel/allmate-kayo-biobio-enduro-action-03.webp',
  'Allmate Motors',
  '2025-10-08 09:30:00',
  TRUE,
  'Nueva estructura de catálogo para enduro, pit bike y mini | News',
  'La página se reorganiza por familias para facilitar la búsqueda de motos, fichas técnicas y repuestos.',
  NULL,
  'index,follow',
  'Article',
  '{"@context":"https://schema.org","@type":"Article"}'::jsonb
),
(
  'Cobertura comercial desde Coronel hacia Concepción y Biobío',
  'cobertura-comercial-desde-coronel-hacia-concepcion-y-biobio',
  'La operación busca captar leads de toda la región, con especial foco en Concepción y Coronel.',
  $$<p>Allmate Motors trabaja su operación comercial desde Coronel, con cobertura específica hacia Concepción, el Gran Concepción y toda la Región del Biobío.</p>
  <p>Esto permite responder consultas de catálogo, repuestos, ofertas y motos KAYO con una propuesta más cercana, rápida y ordenada.</p>
  <img src="/images/carrusel/allmate-kayo-biobio-rider-team-05.webp" alt="Cobertura comercial Allmate Motors en Biobío">
  <p>El sitio acompaña esa estrategia con contenido local, categorías claras y formularios orientados a la conversión.</p>$$,
  '/images/carrusel/allmate-kayo-biobio-rider-team-05.webp',
  'Allmate Motors',
  '2025-07-22 11:15:00',
  TRUE,
  'Cobertura comercial desde Coronel hacia Concepción y Biobío | News',
  'La operación de Allmate Motors busca captar leads de toda la región, con especial foco en Concepción y Coronel.',
  NULL,
  'index,follow',
  'Article',
  '{"@context":"https://schema.org","@type":"Article"}'::jsonb
)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_canonical = EXCLUDED.seo_canonical,
  seo_robots = EXCLUDED.seo_robots,
  schema_type = EXCLUDED.schema_type,
  schema_json = EXCLUDED.schema_json;

COMMIT;

BEGIN;

-- CMS page sections for news
INSERT INTO cms_pages (slug, name, description, is_active, sort_order, seo_title, seo_description, seo_robots, schema_type)
VALUES
('news', 'News', 'Noticias y contenido editorial de Allmate Motors.', TRUE, 40,
 'Noticias KAYO en Concepción y Biobío | Allmate Motors',
 'Noticias, avances de catálogo, cobertura comercial y contenido local de Allmate Motors para reforzar búsquedas de marca y motos KAYO en Concepción y Biobío.',
 'index,follow', 'CollectionPage')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  seo_robots = EXCLUDED.seo_robots,
  schema_type = EXCLUDED.schema_type,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO cms_sections (page_id, section_key, name, title, subtitle, content, layout_type, is_active, sort_order)
SELECT p.id, 'intro', 'News',
       'Contenido local para reforzar marca, catálogo y búsquedas long-tail',
       'Noticias pensadas para consolidar señales de marca, cobertura local y contenido útil alrededor de motos KAYO, catálogo, repuestos y operación comercial en Biobío.',
       'Cada noticia abre una página completa con más imágenes, desarrollo editorial y contexto local para fortalecer la marca Allmate Motors en Google.',
       'news-hero', TRUE, 10
FROM cms_pages p
WHERE p.slug = 'news'
ON CONFLICT (page_id, section_key) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  layout_type = EXCLUDED.layout_type,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

-- Seed / update news articles
INSERT INTO news (title, slug, excerpt, content, image_url, author, published_at, is_active)
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
  TRUE
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
  TRUE
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
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url,
  author = EXCLUDED.author,
  published_at = EXCLUDED.published_at,
  is_active = EXCLUDED.is_active;

COMMIT;

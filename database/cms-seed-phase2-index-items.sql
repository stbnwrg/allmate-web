BEGIN;

-- Hero items (slides / highlight strip)
WITH s AS (
  SELECT cs.id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'hero'
)
INSERT INTO cms_items (
  section_id, item_key, title, subtitle, content,
  button_label, button_url, tag, image_url, image_alt, is_active, sort_order
)
SELECT s.id, x.item_key, x.title, x.subtitle, x.content,
       x.button_label, x.button_url, x.tag, x.image_url, x.image_alt, TRUE, x.sort_order
FROM s,
(VALUES
  ('slide-1', 'Motos KAYO, repuestos y ofertas con atención directa en la zona sur.', 'Catálogo comercial con foco en Coronel, Concepción y la Región del Biobío.', 'El home ya puede leer desde CMS el título, subtítulo, CTA y la imagen principal del hero.', 'Ver catálogo KAYO', 'productos.html', '01', '/images/hero/hero-1.jpeg', 'Hero Allmate Motors con KAYO en Biobío', 10),
  ('strip-2', 'Ofertas y repuestos', 'Modelos destacados y cotización rápida de partes.', 'Bloque corto para reforzar intención comercial.', NULL, NULL, '02', NULL, NULL, 20),
  ('strip-3', 'Cobertura Biobío', 'Coronel, Concepción y el Gran Concepción.', 'Bloque corto para reforzar intención local.', NULL, NULL, '03', NULL, NULL, 30),
  ('strip-4', 'Contacto sin laberintos', 'WhatsApp, mapa, Instagram y formularios claros.', 'Bloque corto para reforzar acción comercial.', NULL, NULL, '04', NULL, NULL, 40)
) AS x(item_key, title, subtitle, content, button_label, button_url, tag, image_url, image_alt, sort_order)
ON CONFLICT DO NOTHING;

-- Carrusel visual items
WITH s AS (
  SELECT cs.id
  FROM cms_sections cs
  JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'carrusel_visual'
)
INSERT INTO cms_items (
  section_id, item_key, title, subtitle, content,
  tag, image_url, image_alt, is_active, sort_order
)
SELECT s.id, x.item_key, x.title, x.subtitle, x.content,
       x.tag, x.image_url, x.image_alt, TRUE, x.sort_order
FROM s,
(VALUES
  ('carrusel-1', 'Comunidad KAYO Biobío', 'Pilotos y actividad real en la zona sur.', 'Imagen editorial para reforzar marca y comunidad.', 'EDITORIAL', '/images/carrusel/allmate-kayo-biobio-enduro-01.webp', 'Comunidad KAYO en Biobío', 10),
  ('carrusel-2', 'Entrenamiento y progresión', 'Pista, barro y aprendizaje local.', 'Imagen visual para reforzar búsquedas long-tail.', 'ENDURO', '/images/carrusel/allmate-kayo-biobio-dirt-track-02.webp', 'Entrenamiento KAYO en Concepción', 20),
  ('carrusel-3', 'Contenido local de marca', 'Visuales para reforzar presencia regional.', 'Imagen visual para reforzar marca y catálogo.', 'MARCA', '/images/carrusel/allmate-kayo-biobio-community-04.webp', 'Contenido local Allmate Motors', 30)
) AS x(item_key, title, subtitle, content, tag, image_url, image_alt, sort_order)
ON CONFLICT DO NOTHING;

COMMIT;

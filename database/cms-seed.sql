BEGIN;

INSERT INTO cms_pages (slug, name, description, sort_order, seo_title, seo_description, seo_robots, schema_type)
VALUES
('index', 'Inicio', 'Portada principal de Allmate Motors', 10, 'Distribuidor KAYO en Concepción y Biobío | Allmate Motors', 'Allmate Motors, distribuidor oficial KAYO en Coronel con cobertura para Concepción y toda la región del Biobío.', 'index,follow', 'LocalBusiness'),
('productos', 'Productos', 'Catálogo de motos y repuestos', 20, 'Motos KAYO en Concepción y Biobío | Allmate Motors', 'Catálogo KAYO con modelos enduro, pit bike, mini y línea ATV/UTV.', 'index,follow', 'CollectionPage'),
('ofertas', 'Ofertas', 'Ofertas activas del catálogo', 30, 'Ofertas KAYO en Biobío | Allmate Motors', 'Ofertas de la semana y promociones activas de Allmate Motors.', 'index,follow', 'CollectionPage'),
('news', 'News', 'Noticias y contenido editorial', 40, 'Noticias KAYO y Allmate en Biobío | Allmate Motors', 'Noticias, lanzamientos y contenido local para reforzar marca, catálogo y búsquedas long-tail.', 'index,follow', 'Blog'),
('contacto', 'Contacto', 'Canales de contacto y ubicación', 50, 'Contacto Allmate Motors | KAYO en Coronel, Concepción y Biobío', 'Contacto directo, ubicación, WhatsApp, Instagram y formulario comercial.', 'index,follow', 'ContactPage')
ON CONFLICT (slug) DO NOTHING;

-- Index sections
WITH p AS (SELECT id FROM cms_pages WHERE slug = 'index')
INSERT INTO cms_sections (page_id, section_key, name, title, subtitle, content, layout_type, sort_order)
SELECT p.id, x.section_key, x.name, x.title, x.subtitle, x.content, x.layout_type, x.sort_order
FROM p,
(VALUES
('hero', 'Hero', 'Distribuidor oficial KAYO en Concepción y la Región del Biobío', 'Motos, repuestos, pit bike, enduro y línea ATV/UTV con atención directa desde Coronel.', 'Allmate Motors opera desde Coronel con cobertura específica hacia el Gran Concepción y toda la región del Biobío.', 'hero', 10),
('categorias', 'Categorías', 'Líneas KAYO y formatos de uso', 'Una vitrina ordenada para que el visitante entienda rápido qué vende Allmate y hacia dónde debe avanzar.', 'Cada bloque de categoría busca capturar intención local real: enduro, pit bike, iniciación y repuestos.', 'cards', 20),
('ofertas_home', 'Ofertas de la semana', 'Modelos KAYO con mejor tracción comercial esta semana', 'Ofertas destacadas para búsquedas transaccionales en Concepción, Coronel y Biobío.', 'Tarjetas visibles con imagen, precio, descripción y acceso a la sección de ofertas.', 'carousel', 30),
('quienes_somos', 'Quiénes somos', 'Allmate no vende humo: vende motos con carácter y respuesta rápida.', 'Distribuidor oficial de KAYO en la Región del Biobío, con cobertura específica desde Coronel al Gran Concepción y toda la región.', 'La propuesta mezcla motos de gama media, repuestos, soporte local y una operación comercial pensada para convertir consultas en ventas reales.', 'split', 40),
('carrusel_visual', 'Carrusel visual', 'Comunidad, pista y contenido local', 'Bloque visual para reforzar marca, comunidad y estilo off-road.', 'Imágenes reales de la comunidad y del entorno KAYO con enfoque editorial y comercial.', 'marquee', 50),
('contacto_ubicacion', 'Contacto y ubicación', 'Atención directa, sin laberintos.', 'Canales visibles, mapa, Instagram y WhatsApp con acceso rápido para que el visitante pase de mirar a escribir.', 'Atención coordinada desde Coronel con foco comercial en Concepción y Región del Biobío.', 'contact', 60)
) AS x(section_key, name, title, subtitle, content, layout_type, sort_order)
ON CONFLICT (page_id, section_key) DO NOTHING;

-- Categorias items
WITH s AS (
  SELECT cs.id FROM cms_sections cs JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'categorias'
)
INSERT INTO cms_items (section_id, item_key, title, subtitle, content, button_label, button_url, tag, image_url, image_alt, sort_order)
SELECT s.id, x.item_key, x.title, x.subtitle, x.content, x.button_label, x.button_url, x.tag, x.image_url, x.image_alt, x.sort_order
FROM s,
(VALUES
('enduro', 'Enduro y nivel medio', 'Motos enduro KAYO en Concepción y Biobío.', 'Modelos para trail, iniciación seria y riders que buscan una moto enduro KAYO con atención local.', 'Ver modelos', 'productos.html#enduro', 'DIRT BIKE / ENDURO', '/images/productos/t4-250/t4-250-1.jpg', 'Moto enduro KAYO T4 250 en Biobío', 10),
('pit-bike', 'Compactas y progresión', 'Pit bike KAYO para práctica y progresión.', 'Motos para entrar al mundo KAYO, practicar, progresar y captar búsquedas de pit bike en Biobío.', 'Ver pit bike', 'productos.html#pit-bike', 'PIT BIKE', '/images/productos/tt160/tt160-1.jpg', 'Pit bike KAYO TT160 en Concepción', 20),
('iniciacion', 'Iniciación y ATV / UTV', 'Línea de iniciación, mini y ATV / UTV KAYO.', 'Línea de iniciación, entretenimiento y búsqueda comercial para quienes quieren ATV/UTV KAYO bajo pedido.', 'Ver iniciación', 'productos.html#atv-utv', 'ATV / UTV', '/images/hero/hero-1.jpeg', 'ATV KAYO en Biobío', 30),
('repuestos', 'Repuestos y soporte real', 'Cotización rápida de repuestos KAYO.', 'Cotización rápida para identificar la pieza correcta y convertir una necesidad técnica en una venta ordenada.', 'Cotizar repuesto', 'productos.html#repuestos', 'REPUESTOS', '/images/branding/logo-secundario.jpeg', 'Repuestos KAYO en Coronel', 40)
) AS x(item_key, title, subtitle, content, button_label, button_url, tag, image_url, image_alt, sort_order)
ON CONFLICT DO NOTHING;

-- Quienes somos items
WITH s AS (
  SELECT cs.id FROM cms_sections cs JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'quienes_somos'
)
INSERT INTO cms_items (section_id, item_key, title, content, tag, sort_order)
SELECT s.id, x.item_key, x.title, x.content, x.tag, x.sort_order
FROM s,
(VALUES
('foco-comercial', 'Foco comercial', 'Catálogo ordenado, fichas individuales, ofertas visibles y CTA pensados para capturar búsquedas locales y convertirlas en consultas reales.', '01', 10),
('estetica-offroad', 'Estética off-road', 'Contenido visual con look KAYO, lenguaje de zona sur y enfoque en categorías que sí responden a lo que busca el cliente.', '02', 20),
('sucursal-cobertura', 'Sucursal y cobertura', 'Calle Corcovado #991, Cerro Santa Elena, Coronel. Cobertura desde Coronel al Gran Concepción y toda la Región del Biobío.', '03', 30)
) AS x(item_key, title, content, tag, sort_order)
ON CONFLICT DO NOTHING;

-- Contacto items
WITH s AS (
  SELECT cs.id FROM cms_sections cs JOIN cms_pages p ON p.id = cs.page_id
  WHERE p.slug = 'index' AND cs.section_key = 'contacto_ubicacion'
)
INSERT INTO cms_items (section_id, item_key, title, content, button_label, button_url, icon, sort_order)
SELECT s.id, x.item_key, x.title, x.content, x.button_label, x.button_url, x.icon, x.sort_order
FROM s,
(VALUES
('whatsapp', 'WhatsApp', '+56 9 9217 8719', 'Escribir ahora', 'https://wa.me/56992178719', 'whatsapp', 10),
('correo', 'Correo', 'erojas@esterospa.cl', 'Enviar correo', 'mailto:erojas@esterospa.cl', 'mail', 20),
('direccion', 'Dirección', 'Calle Corcovado #991, Cerro Santa Elena, Coronel', 'Ver mapa', 'https://maps.app.goo.gl/Qd9GY7afANL3JM3a6', 'map-pin', 30),
('instagram', 'Instagram', '@allmatemotors.cl', 'Ver Instagram', 'https://instagram.com/allmatemotors.cl', 'instagram', 40)
) AS x(item_key, title, content, button_label, button_url, icon, sort_order)
ON CONFLICT DO NOTHING;

-- Global settings
INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public)
VALUES
('business_name', 'Allmate Motors', 'branding', TRUE),
('business_tagline', 'Distribuidor oficial KAYO', 'branding', TRUE),
('site_phone', '+56 9 9217 8719', 'contacto', TRUE),
('site_whatsapp', 'https://wa.me/56992178719', 'contacto', TRUE),
('site_email', 'erojas@esterospa.cl', 'contacto', TRUE),
('site_instagram', 'https://instagram.com/allmatemotors.cl', 'contacto', TRUE),
('site_address', 'Calle Corcovado #991, Cerro Santa Elena, Coronel', 'contacto', TRUE),
('site_region', 'Región del Biobío', 'contacto', TRUE),
('footer_text', 'Distribuidor oficial de KAYO en la Región del Biobío, con cobertura específica desde Coronel, al Gran Concepción y toda la región.', 'footer', TRUE),
('google_maps_embed', 'https://www.google.com/maps?q=Calle%20Corcovado%20991%20Coronel&output=embed', 'contacto', TRUE)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP;

COMMIT;

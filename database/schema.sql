DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS hero_slides CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) UNIQUE NOT NULL,
  brand VARCHAR(80) DEFAULT 'KAYO',
  category VARCHAR(80) NOT NULL,
  status VARCHAR(30) DEFAULT 'Consultar',
  sort_order INTEGER DEFAULT 100,
  engine_cc INTEGER,
  engine_type VARCHAR(120),
  cooling VARCHAR(80),
  transmission VARCHAR(120),
  start_type VARCHAR(80),
  suspension_front VARCHAR(180),
  suspension_rear VARCHAR(180),
  seat_height VARCHAR(80),
  weight_kg VARCHAR(80),
  stock INTEGER DEFAULT 0,
  price INTEGER,
  old_price INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  payment_link TEXT,
  brochure_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hero_slides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  subtitle TEXT,
  cta_label VARCHAR(120),
  cta_url TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author VARCHAR(100) DEFAULT 'Allmate Motors',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  buy_order VARCHAR(80) UNIQUE NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(40),
  amount INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  payment_method VARCHAR(30) DEFAULT 'webpay',
  items JSONB NOT NULL,
  webpay_token VARCHAR(120),
  webpay_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(40),
  subject VARCHAR(160),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (
  name, slug, brand, category, status, sort_order, engine_cc, engine_type, cooling, transmission, start_type,
  suspension_front, suspension_rear, seat_height, weight_kg, stock, price, old_price, featured,
  short_description, description, image_url, gallery, specs, payment_link
)
VALUES
(
  'KAYO KMB60', 'kayo-kmb60', 'KAYO', 'Mini', 'Consultar', 10, 57, '1 cilindro, 4 tiempos', 'Aire', 'Automática', 'Eléctrico',
  '540 mm no ajustable', '270 mm no ajustable', NULL, '60 kg', 0, NULL, NULL, TRUE,
  'Moto de entrada para niños y primeros pasos en motocross.',
  'Modelo pensado para pilotos pequeños que quieren comenzar con una moto compacta, simple y amigable. Ya quedó cargado en el catálogo y puedes subir la foto real desde el panel admin.',
  '/images/productos/kayo-kmb60.jpg',
  '[]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"12 / 10","combustible":"3.5 L","potencia":"Información por confirmar","observacion":"Transmisión completamente automática"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO T4 300 cc', 'kayo-t4-300-cc', 'KAYO', 'Enduro', 'Consultar', 20, 271, '1 cilindro, 4 tiempos', 'Aire', 'Manual 6 velocidades', 'Eléctrico',
  '880 mm ajustable', '450 mm ajustable', '925 mm', NULL, 0, NULL, NULL, TRUE,
  'Enduro con cilindrada alta para riders que quieren torque y presencia.',
  'Precargada como modelo destacado del catálogo Allmate. Se dejó con datos base para que luego ajustes precio local, fotos reales y brochure.',
  '/images/productos/kayo-t4-300-cc.jpg',
  '[]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"10 L","potencia":"Información por confirmar","observacion":"Modelo con datos de referencia oficiales por mercado extranjero"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO T4 250 cc', 'kayo-t4-250-cc', 'KAYO', 'Enduro', 'Disponible', 30, 250, '1 cilindro, 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico y patada',
  'Horquilla invertida', 'Monoshock', NULL, NULL, 0, 2890000, 2990000, TRUE,
  'Enduro 250 con foco en progresión, cerro y uso recreativo intenso.',
  'Se dejó con precio referencial de Kayomoto Chile para que partas con una vitrina lista. Si tu valor comercial cambia, lo ajustas en admin en menos de un minuto.',
  '/images/productos/kayo-t4-250-cc.jpg',
  '[]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"12.5 hp / 8.000 rpm","observacion":"Precio precargado como referencia Chile"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO K4', 'kayo-k4', 'KAYO', 'Enduro', 'Consultar', 40, 250, '1 cilindro, 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico',
  'Horquilla invertida', 'Monoamortiguador', '925 mm', '115.5 kg', 0, NULL, NULL, TRUE,
  'Modelo intermedio con look agresivo y base ideal para riders que quieren subir de nivel.',
  'La ficha quedó cargada como referencia inicial. Este es uno de los modelos donde conviene subir foto real y precio local apenas los tengas cerrados.',
  '/images/productos/kayo-k4.jpg',
  '[]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"7.5 L","potencia":"Información por confirmar","observacion":"Datos técnicos de referencia internacional"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO T2 Pro', 'kayo-t2-pro', 'KAYO', 'Enduro', 'Disponible', 50, 250, '1 cilindro, 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico y patada',
  'Horquilla invertida', 'Monoshock', NULL, NULL, 0, 2390000, 2490000, TRUE,
  'Enduro de entrada seria para sendero, aprendizaje técnico y diversión sin vueltas.',
  'Se dejó con precio referencial del proveedor en Chile. Completa las fotos y el detalle comercial desde el panel.',
  '/images/productos/kayo-t2-pro.jpg',
  '[]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Precio precargado como referencia Chile"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO K2', 'kayo-k2', 'KAYO', 'Enduro', 'Disponible', 60, 223, 'SOHC 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico y patada',
  'Horquillas invertidas', 'Mono shock', NULL, NULL, 0, 1990000, 2099000, TRUE,
  'Modelo ideal para entrar al enduro con una base conocida y bien plantada.',
  'Ya viene precargado con el valor de referencia del proveedor en Chile y datos técnicos iniciales. Falta subir foto real si quieres reemplazar el placeholder.',
  '/images/productos/kayo-k2.jpg',
  '[]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"16 hp @ 7500 rpm","observacion":"Modelo tipo K2 Road / K2 Enduro según mercado"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO TT160', 'kayo-tt160', 'KAYO', 'Pit Bike', 'Disponible', 70, 156, '1 cilindro, 4 tiempos', 'Aceite', 'Manual 4 velocidades', 'Patada',
  '660 mm', '345 mm', NULL, '86 kg', 0, 1390000, NULL, FALSE,
  'Pit bike con más presencia y potencia para quienes quieren más motor sin irse directo al enduro grande.',
  'La TT160 quedó cargada con datos base del sitio oficial KAYO y precio referencial del proveedor local de la familia Pit Bike.',
  '/images/productos/kayo-tt160.jpg',
  '[]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"17 / 14","combustible":"5.5 L","potencia":"14 HP / 9500 rpm","observacion":"Precio cargado como referencia comercial local de línea Pit Bike"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO TT140', 'kayo-tt140', 'KAYO', 'Pit Bike', 'Consultar', 80, 140, '1 cilindro, 4 tiempos', 'Aceite', 'Manual 4 velocidades', 'Patada',
  '735 mm no ajustable', '360 mm no ajustable', '855 mm', '73 kg', 0, NULL, NULL, FALSE,
  'Pit bike ágil, simple y bien parada para escuela, práctica y diversión.',
  'El modelo quedó cargado con especificaciones base. Falta el valor local definitivo, por eso aparece en consultar.',
  '/images/productos/kayo-tt140.jpg',
  '[]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"17 / 14","combustible":"5.5 L","potencia":"Información por confirmar","observacion":"Modelo precargado con datos oficiales KAYO México"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO TT125', 'kayo-tt125', 'KAYO', 'Pit Bike', 'Disponible', 90, 120, '1 cilindro, 4 tiempos', 'Aire', 'Manual 4 velocidades', 'Patada',
  'Horquilla invertida no ajustable', 'Amortiguador de resorte', '855 mm', '72 kg', 0, 1200000, NULL, FALSE,
  'Pit bike noble para comenzar y progresar sin pegarte un sablazo.',
  'Ya se dejó con valor referencial local. Puedes completar la galería y brochure desde admin.',
  '/images/productos/kayo-tt125.jpg',
  '[]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"17 / 14","combustible":"5.5 L","potencia":"7.5 HP / 8000 rpm","observacion":"Precio base cargado desde categoría Pit Bike del proveedor en Chile"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO TS90', 'kayo-ts90', 'KAYO', 'Mini', 'Consultar', 100, 86, '1 cilindro, 4 tiempos', 'Aire', 'Semi automática 4 velocidades', 'Patada y eléctrico',
  '540 mm no ajustable', '270 mm no ajustable', NULL, '60 kg', 0, NULL, NULL, FALSE,
  'Mini off-road para dar el salto desde lo básico con control y diversión.',
  'Precargada con datos técnicos oficiales. Falta el precio Chile y las imágenes finales del producto.',
  '/images/productos/kayo-ts90.jpg',
  '[]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"12 / 10","combustible":"3.5 L","potencia":"Información por confirmar","observacion":"Ideal para aprendizaje y primeras aventuras"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO TD125', 'kayo-td125', 'KAYO', 'Pit Bike', 'Disponible', 110, 125, '1 cilindro, 4 tiempos', 'Aire', 'Manual 4 velocidades', 'Patada',
  'Horquilla invertida', 'Monoshock', NULL, NULL, 0, 1190000, NULL, FALSE,
  'Pit bike deportiva para terreno irregular y manejo recreativo intenso.',
  'Modelo con base comercial chilena ya cargada para que no partas desde cero. Puedes subir foto real y brochure cuando los tengas.',
  '/images/productos/kayo-td125.jpg',
  '[]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"Información por confirmar","combustible":"Información por confirmar","potencia":"12 CV","observacion":"Descripción comercial basada en proveedor Chile"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
),
(
  'KAYO TSD110', 'kayo-tsd110', 'KAYO', 'Mini', 'Consultar', 120, 107, '1 cilindro, 4 tiempos', 'Aire', 'Semi automática 4 velocidades', 'Patada',
  '630 mm', 'Información por confirmar', '740 mm', '60 kg', 0, NULL, NULL, FALSE,
  'Mini motocross de transición para jóvenes pilotos.',
  'El producto quedó listo para ser completado. El sitio ya muestra ficha básica y puedes cargar su imagen real desde admin o manualmente.',
  '/images/productos/kayo-tsd110.jpg',
  '[]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"14 / 12","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Transición suave al motocross para pilotos jóvenes"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308'
);

INSERT INTO hero_slides (title, subtitle, cta_label, cta_url, image_url, sort_order)
VALUES
('Potencia real. Control total.', 'Distribuidor oficial KAYO en la región del Biobío. Un sitio con estética agresiva, foco comercial y contenido listo para crecer.', 'Ver catálogo', 'productos.html', '/images/hero/hero-1.jpeg', 1),
('Mundo off-road Allmate.', 'Modelos para iniciación, pit bike y enduro, con fichas técnicas expandibles y atención directa por WhatsApp.', 'Hablar con Allmate', 'contacto.html', '/images/hero/hero-2.jpeg', 2),
('Catálogo con actitud.', 'Inspirado en la lógica visual de KAYO, pero aterrizado a la marca Allmate y su operación real.', 'Conocer modelos', 'productos.html', '/images/hero/hero-3.jpeg', 3),
('Comunidad y competencia.', 'El hero queda administrable desde el panel, así podrás rotar campañas, lanzamientos o fotos de carrera sin tocar código.', 'Ir al panel', 'admin.html', '/images/hero/hero-4.jpeg', 4),
('Catálogo listo para vender.', 'CTAs visibles, carrito, link Webpay general y base preparada para checkout más avanzado cuando toque.', 'Ver carrito', 'carrito.html', '/images/hero/hero-5.jpeg', 5),
('Power and Trust.', 'La identidad visual usa los colores y el tono del manual de marca Allmate para mantener consistencia.', 'Contactar', 'contacto.html', '/images/hero/hero-6.jpeg', 6);

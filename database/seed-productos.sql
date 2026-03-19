BEGIN;

DELETE FROM products;

INSERT INTO products (
  name, slug, brand, category, status, sort_order,
  engine_cc, engine_type, cooling, transmission, start_type,
  suspension_front, suspension_rear, seat_height, weight_kg,
  stock, price, old_price, featured,
  short_description, description,
  image_url, gallery, specs,
  payment_link, brochure_url, is_active
)
VALUES
(
  'KAYO KMB60', 'kayo-kmb60', 'KAYO', 'Mini', 'Disponible', 10,
  60, '4 tiempos', 'Aire', 'Automática', 'Eléctrico',
  'Delantera hidráulica', 'Trasera hidráulica', NULL, NULL,
  0, 940000, NULL, TRUE,
  'Mini ATV ideal para iniciación, fácil de manejar y perfecto para primeros pasos off-road.',
  'El KMB60 es una excelente puerta de entrada al mundo ATV infantil. Compacto, estable y pensado para acompañar las primeras experiencias de manejo en terrenos recreativos.',
  '/images/productos/kmb60/kmb60-1.jpg',
  '["/images/productos/kmb60/kmb60-2.jpg"]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"ATV mini","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Modelo infantil orientado a iniciación"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO T4 300 cc', 'kayo-t4-300-cc', 'KAYO', 'Enduro', 'Disponible', 20,
  300, '1 cilindro, 4 tiempos', 'Aire', 'Manual 6 velocidades', 'Eléctrico',
  'Horquilla invertida', 'Monoshock', NULL, NULL,
  0, 2840000, NULL, TRUE,
  'Enduro de mayor cilindrada para uso deportivo, con buen empuje y presencia en ruta o circuito.',
  'La T4 300 cc está pensada para quienes buscan una enduro con más carácter, torque y presencia. Ideal para uso recreativo exigente, senderos y conducción deportiva.',
  '/images/productos/t4-300/t4-300-1.jpg',
  '["/images/productos/t4-300/t4-300-2.jpg"]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Modelo destacado para uso off-road deportivo"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO T4 250 cc', 'kayo-t4-250-cc', 'KAYO', 'Enduro', 'Disponible', 30,
  250, '1 cilindro, 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico y patada',
  'Horquilla invertida', 'Monoshock', NULL, NULL,
  0, 2750000, NULL, TRUE,
  'Enduro equilibrada para ruta y circuito, pensada para riders que buscan control y rendimiento.',
  'La T4 250 cc combina potencia, maniobrabilidad y una base confiable para enfrentar rutas, senderos y entrenamiento técnico. Un modelo equilibrado y muy comercial.',
  '/images/productos/t4-250/t4-250-1.jpg',
  '["/images/productos/t4-250/t4-250-2.jpg"]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Enduro de balance ideal entre control y respuesta"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO K4', 'kayo-k4', 'KAYO', 'Enduro', 'Disponible', 40,
  250, '1 cilindro, 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico',
  'Horquilla invertida', 'Monoamortiguador', '925 mm', '115.5 kg',
  0, 2450000, NULL, FALSE,
  'Enduro versátil y robusta, ideal para quienes buscan potencia, estabilidad y uso recreativo exigente.',
  'La K4 ofrece una propuesta sólida para quienes quieren subir de nivel en enduro. Su enfoque está en la estabilidad, el control y una experiencia firme en terrenos variables.',
  '/images/productos/k4/k4-1.jpg',
  '["/images/productos/k4/k4-2.jpg"]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Modelo versátil para uso recreativo y deportivo"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO T2 Pro', 'kayo-t2-pro', 'KAYO', 'Enduro', 'Disponible', 50,
  250, '1 cilindro, 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico y patada',
  'Horquilla invertida', 'Monoshock', NULL, NULL,
  0, 2250000, NULL, TRUE,
  'Enduro ágil y competitiva, diseñada para entregar una conducción firme y divertida en todo terreno.',
  'La T2 Pro es una enduro de enfoque práctico y deportivo. Se mueve bien en terrenos irregulares y es una gran opción para quienes quieren una moto entretenida y con buena presencia.',
  '/images/productos/t2-pro/t2-pro-1.jpg',
  '["/images/productos/t2-pro/t2-pro-2.jpg"]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Modelo destacado por relación precio-rendimiento"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO K2', 'kayo-k2', 'KAYO', 'Enduro', 'Disponible', 60,
  223, 'SOHC 4 tiempos', 'Aire', 'Manual 5 velocidades', 'Eléctrico y patada',
  'Horquillas invertidas', 'Mono shock', NULL, NULL,
  0, 1790000, NULL, TRUE,
  'Modelo enduro accesible y confiable, ideal para iniciarse en el off-road con gran relación precio-calidad.',
  'La K2 es una excelente alternativa para entrar al mundo enduro con una base reconocida, buen look y un precio competitivo dentro del catálogo Allmate.',
  '/images/productos/k2/k2-1.jpg',
  '["/images/productos/k2/k2-2.jpg"]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"21 / 18","combustible":"Información por confirmar","potencia":"16 hp @ 7500 rpm","observacion":"Ideal para entrada al mundo enduro"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO TT160', 'kayo-tt160', 'KAYO', 'Pit Bike', 'Disponible', 70,
  160, '1 cilindro, 4 tiempos', 'Aceite', 'Manual 4 velocidades', 'Patada',
  'Delantera reforzada', 'Trasera deportiva', NULL, '86 kg',
  0, 1500000, NULL, TRUE,
  'Pit Bike de gran respuesta y carácter deportivo, ideal para diversión intensa y entrenamiento técnico.',
  'La TT160 es una pit bike con actitud. Buena respuesta, estética agresiva y una propuesta ideal para quienes quieren más motor y diversión en espacios técnicos o recreativos.',
  '/images/productos/tt160/tt160-1.jpg',
  '["/images/productos/tt160/tt160-2.jpg"]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"17 / 14","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Pit bike destacada dentro del catálogo"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO TT140', 'kayo-tt140', 'KAYO', 'Pit Bike', 'Disponible', 80,
  140, '1 cilindro, 4 tiempos', 'Aceite', 'Manual 4 velocidades', 'Patada',
  'Delantera convencional', 'Trasera reforzada', '855 mm', '73 kg',
  0, 1400000, NULL, FALSE,
  'Pit Bike equilibrada, maniobrable y potente, perfecta para quienes quieren subir de nivel.',
  'La TT140 entrega una combinación muy buena entre tamaño, control y respuesta. Es una pit bike ideal para progresar y ganar confianza con un formato entretenido.',
  '/images/productos/tt140/tt140-1.jpg',
  '["/images/productos/tt140/tt140-2.jpg"]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"17 / 14","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Buena alternativa de progresión en pit bike"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO TT125', 'kayo-tt125', 'KAYO', 'Pit Bike', 'Disponible', 90,
  125, '1 cilindro, 4 tiempos', 'Aire', 'Manual 4 velocidades', 'Patada',
  'Horquilla invertida no ajustable', 'Amortiguador de resorte', '855 mm', '72 kg',
  0, 1300000, NULL, FALSE,
  'Pit Bike compacta y entretenida, ideal para iniciación, práctica y uso recreativo con actitud.',
  'La TT125 es una pit bike noble, cómoda para comenzar y muy útil para entrenamiento recreativo. Buen punto de entrada para quienes buscan algo ágil y entretenido.',
  '/images/productos/tt125/tt125-1.jpg',
  '["/images/productos/tt125/tt125-2.jpg"]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"17 / 14","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Modelo de entrada en la familia pit bike"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO TS90', 'kayo-ts90', 'KAYO', 'Mini', 'Disponible', 100,
  90, '1 cilindro, 4 tiempos', 'Aire', 'Semi automática', 'Patada y eléctrico',
  'Delantera hidráulica', 'Trasera hidráulica', NULL, NULL,
  0, 1000000, NULL, FALSE,
  'Mini moto ágil y liviana, perfecta para jóvenes pilotos que comienzan en el mundo off-road.',
  'La TS90 está pensada para acompañar procesos de aprendizaje con una moto de tamaño amigable, controlable y entretenida para el uso recreativo en terrenos suaves.',
  '/images/productos/ts90/ts90-1.jpg',
  '["/images/productos/ts90/ts90-2.jpg"]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"Mini off-road","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Ideal para jóvenes pilotos en etapa inicial"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO TD125', 'kayo-td125', 'KAYO', 'Pit Bike', 'Disponible', 110,
  125, '1 cilindro, 4 tiempos', 'Aire', 'Manual 4 velocidades', 'Patada',
  'Horquilla invertida', 'Monoshock', NULL, NULL,
  0, 1200000, NULL, FALSE,
  'Pit Bike confiable y dinámica, pensada para quienes buscan rendimiento, control y diversión total.',
  'La TD125 ofrece una propuesta muy atractiva para uso recreativo y entrenamiento. Se siente dinámica, accesible y bien plantada dentro de la línea pit bike.',
  '/images/productos/td125/td125-1.jpg',
  '["/images/productos/td125/td125-2.jpg"]'::jsonb,
  '{"frenos":"Disco delantero y trasero","llantas":"Información por confirmar","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Pit bike recreativa con buena relación precio-rendimiento"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
),
(
  'KAYO TSD110', 'kayo-tsd110', 'KAYO', 'Mini', 'Disponible', 120,
  110, '1 cilindro, 4 tiempos', 'Aire', 'Semi automática', 'Patada',
  'Delantera convencional', 'Trasera reforzada', '740 mm', '60 kg',
  0, 1100000, NULL, FALSE,
  'Mini moto ideal para aprendizaje y recreación, con tamaño cómodo y manejo amigable para iniciarse.',
  'La TSD110 es una excelente opción para quienes están en transición hacia una mini moto con más presencia, manteniendo un enfoque amigable para aprendizaje y uso recreativo.',
  '/images/productos/tsd110/tsd110-1.jpg',
  '["/images/productos/tsd110/tsd110-2.jpg"]'::jsonb,
  '{"frenos":"Hidráulico delantero y trasero","llantas":"14 / 12","combustible":"Información por confirmar","potencia":"Información por confirmar","observacion":"Buena alternativa de transición para jóvenes pilotos"}'::jsonb,
  'https://www.webpay.cl/form-pay/204308', NULL, TRUE
);

COMMIT;
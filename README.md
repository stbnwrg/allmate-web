# Allmate Website

## Qué incluye esta versión
- Home inspirada en el modelo visual de KAYO, adaptada a Allmate.
- Catálogo precargado con los modelos compartidos.
- Fichas técnicas expandibles.
- Formulario de contacto y datos reales de Allmate.
- Link Webpay general conectado.
- Panel admin para productos, hero y noticias.
- Estructura lista para cargar imágenes reales.

## Instalación rápida
1. Copia `.env.example` a `.env`
2. Crea una base PostgreSQL vacía
3. Ejecuta `database/schema.sql`
4. Instala dependencias con `npm install`
5. Levanta el proyecto con `npm run dev`
6. Abre `http://localhost:4000`

## Dónde subir imágenes
- Logos: `frontend/images/branding/`
- Hero manual: `frontend/images/hero/`
- Placeholders y apoyo: `frontend/images/productos/`
- Carga dinámica desde admin: `backend/uploads/`
- Material fuente para ordenar assets: `allmate-web-content/`

## Panel admin
- URL: `http://localhost:4000/admin.html`
- Credenciales iniciales: revisar `.env`

## Pago
- El sitio usa el link general Webpay entregado por el cliente.
- También deja listo el backend base para Webpay transaccional con SDK.

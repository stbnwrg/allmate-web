# Fase 5 · SEO técnico

## Archivos incluidos
- backend/routes/seo.js
- frontend/js/seo-page.js
- database/cms-seo-phase5.sql

## Objetivo
Dejar el proyecto listo para lanzamiento con una base SEO técnica real:
- robots.txt dinámico
- sitemap.xml dinámico
- campos SEO modelados en base de datos
- helper JS para canonical, meta tags y JSON-LD de producto/noticia

## Paso 1 · Ejecutar SQL
node scripts/run-sql.js database/cms-seo-phase5.sql

## Paso 2 · Registrar la ruta SEO en backend/server.js
Agregar arriba:
const seoRoutes = require('./routes/seo');

Agregar debajo de otros app.use:
app.use('/', seoRoutes);

## Paso 3 · Cargar helper SEO en páginas dinámicas
Agregar antes del cierre de body en:
- frontend/producto.html
- frontend/noticia.html
- frontend/index.html
- frontend/productos.html
- frontend/news.html
- frontend/contacto.html
- frontend/ofertas.html

<script src="js/seo-page.js"></script>

## Paso 4 · Integración recomendada
### producto.html
Después de cargar el producto desde la API:
SeoPage.setProductSeo(producto);

### noticia.html
Después de cargar la noticia desde la API:
SeoPage.setArticleSeo(noticia);

### páginas estáticas
Usar:
SeoPage.setStaticSeo({...})

## Paso 5 · Verificar
- /robots.txt
- /sitemap.xml
- producto.html?slug=...
- noticia.html?slug=...

## Recomendación
Cuando tengas el dominio final, agrega también:
SITE_URL=https://www.allmate.cl

en .env local y en producción.

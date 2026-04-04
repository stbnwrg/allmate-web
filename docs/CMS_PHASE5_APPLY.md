# Fase 5 integrada

## Archivos modificados
- frontend/index.html
- frontend/productos.html
- frontend/producto.html
- frontend/news.html
- frontend/noticia.html
- frontend/ofertas.html
- frontend/contacto.html

## Archivos nuevos
- frontend/js/seo-page.js
- backend/routes/seo.js
- database/cms-seo-phase5.sql
- backend/server.phase5.patch.txt

## Pasos
1. Reemplaza/copias los archivos del ZIP.
2. Ejecuta:
```bash
node scripts/run-sql.js database/cms-seo-phase5.sql
```
3. En `backend/server.js` agrega:
```js
const seoRoutes = require("./routes/seo");
```
y luego:
```js
app.use("/", seoRoutes);
```
4. Reinicia:
```bash
npm run dev
```
5. Verifica:
- /robots.txt
- /sitemap.xml
- /producto.html?slug=kayo-k2
- /noticia.html?slug=allmate-motors-fortalece-su-vitrina-kayo-en-biobio


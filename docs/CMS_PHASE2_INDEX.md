# Fase 2 – Conectar Home público al mini CMS

## Qué hace esta fase
Conecta `index.html` al contenido del mini CMS sin romper el diseño actual.

Secciones que ya lee desde DB:
- Hero
- Categorías
- Carrusel visual
- Quiénes somos
- Contacto y ubicación
- Footer / settings globales

## Archivos a reemplazar
- `frontend/index.html`
- `frontend/js/cms-public.js`

## Archivo opcional para cargar contenido inicial multimedia
- `database/cms-seed-phase2-index-items.sql`

## Paso a paso
1. Copia los archivos del patch.
2. Reinicia el backend:
   ```bash
   npm run dev
   ```
3. Si quieres dejar Hero y Carrusel con ítems reales desde CMS, ejecuta:
   ```bash
   node scripts/run-sql.js database/cms-seed-phase2-index-items.sql
   ```
4. Abre:
   - `http://localhost:4000/`
   - `http://localhost:4000/admin.html`

## Cómo validar
- Cambia un texto en `Index > Hero` desde el admin y recarga el home.
- Cambia una tarjeta en `Index > Categorías` y recarga el home.
- Edita `Index > Contacto y ubicación` y revisa los bloques.
- Cambia un setting global como `footer_text` y revisa el pie.

## Qué falta para la siguiente fase
- Productos y repuestos conectados al CMS
- News conectado al CMS editorial
- SEO editable desde admin
- Sitemap / robots / canonicals

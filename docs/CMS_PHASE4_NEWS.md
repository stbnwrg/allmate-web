# Fase 4 · News conectado al CMS

## Objetivo
Conectar la página `news.html` y la página individual `noticia.html` a la capa CMS / API sin romper la tabla `news` existente.

## Qué cambia
- `news.html` toma su intro desde `cms_pages/cms_sections`
- el listado de noticias sale de `GET /api/news`
- `noticia.html` carga una noticia por slug desde `GET /api/news/:slug`
- el contenido de la noticia soporta HTML enriquecido en la columna `content`

## SQL a ejecutar
```bash
node scripts/run-sql.js database/cms-seed-phase4-news.sql
```

## Archivos a reemplazar
- `backend/routes/news.js`
- `frontend/news.html`
- `frontend/noticia.html`
- `frontend/js/cms-public.js`
- `frontend/css/news-cms.css`

## Notas
- No toca `.env`
- No toca `seed-productos.sql`
- No requiere cambios de schema adicionales

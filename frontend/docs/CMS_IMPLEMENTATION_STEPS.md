# Allmate Mini CMS — Paso a paso

## Qué incluye este patch
- Modelo de base de datos CMS
- Seed base para páginas, secciones, ítems y settings globales
- Rutas públicas `/api/cms/*`
- Rutas admin `/api/admin/cms/*`
- Nuevo panel admin tipo mini CMS
- Helper `frontend/js/cms-public.js` para ir migrando páginas públicas a contenido dinámico

## Paso 1 — Archivos que debes copiar
### Backend
- `backend/server.js`
- `backend/routes/cms.js`
- `backend/routes/adminCms.js`
- `backend/controllers/cms/publicController.js`
- `backend/controllers/cms/adminController.js`
- `backend/services/cms/cmsService.js`

### Frontend
- `frontend/admin.html`
- `frontend/js/admin.js`
- `frontend/js/cms-public.js`
- `frontend/css/admin-cms.css`

### Database
- `database/cms-schema.sql`
- `database/cms-seed.sql`

## Paso 2 — Crear carpetas si no existen
```text
backend/controllers/cms/
backend/services/cms/
frontend/css/
frontend/js/
database/
```

## Paso 3 — Ejecutar el SQL del CMS
Primero ejecuta:
```bash
node scripts/run-sql.js database/cms-schema.sql
```

Después:
```bash
node scripts/run-sql.js database/cms-seed.sql
```

## Paso 4 — Reiniciar backend
```bash
npm run dev
```

## Paso 5 — Entrar al panel
Ruta:
```text
/admin.html
```

Usa el mismo login admin que ya tienes en `.env`.

## Paso 6 — Qué puedes administrar desde esta fase
### Index
- Hero
- Categorías
- Ofertas de la semana
- Quiénes somos
- Carrusel visual
- Contacto y ubicación

### Global
- Teléfono
- WhatsApp
- Email
- Instagram
- Dirección
- Footer
- Google Maps embed

## Paso 7 — Qué queda modelado para la siguiente fase
- Productos como fichas individuales bajo el mismo CMS
- News enriquecidas
- SEO por página desde admin
- Activación/desactivación de bloques avanzados

## Paso 8 — Integración progresiva del frontend público
No hace falta migrar toda la web de golpe.

La idea correcta es:
1. dejar la web funcionando como está
2. empezar por el `index`
3. luego contacto / footer
4. después ofertas y news
5. finalmente productos y repuestos

## Paso 9 — Cómo empezar a consumir CMS desde una página pública
Incluye en la página:
```html
<script src="js/cms-public.js"></script>
```

Luego:
```html
<script>
(async () => {
  const payload = await AllmateCMS.fetchCmsPage('index');
  const sections = AllmateCMS.cmsSectionMap(payload);
  AllmateCMS.applyCmsSeo(payload.page);
  // Aquí reasignas títulos, textos e imágenes.
})();
</script>
```

## Paso 10 — Siguiente fase recomendada
- conectar `index.html` al CMS
- conectar `contacto.html` y footer
- migrar ofertas
- migrar news
- migrar productos y repuestos

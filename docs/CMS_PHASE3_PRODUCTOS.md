# Fase 3 – Productos + Repuestos conectados al CMS

## Archivos a reemplazar
- frontend/productos.html
- frontend/js/cms-public.js

## SQL opcional
Si quieres cargar textos CMS para productos y repuestos:

```bash
node scripts/run-sql.js database/cms-seed-phase3-productos.sql
```

## Qué hace esta fase
- El hero/intro de productos se lee desde el CMS.
- La sección de repuestos se lee desde el CMS.
- Los productos siguen viniendo desde `/api/productos`.
- Los filtros superiores siguen funcionando.
- Cada tarjeta de producto sigue enlazando a `producto.html?slug=...`.

## Qué no toca
- .env
- database/seed-productos.sql
- estructura de productos en BD

# Fase 3 limpia: Productos

## Objetivo
Conectar el texto del encabezado de `productos.html` y el bloque de `repuestos` al mini CMS,
**sin tocar la grilla visual de motos** ni el render viejo que ya funcionaba bien.

## Archivos incluidos
- `frontend/productos.html`
- `frontend/js/cms-public.js`
- `database/cms-seed-phase3-productos-limpio.sql`

## Qué debes hacer
1. Reemplazar `frontend/productos.html`
2. Reemplazar `frontend/js/cms-public.js`
3. Ejecutar:
   ```bash
   node scripts/run-sql.js database/cms-seed-phase3-productos-limpio.sql
   ```
4. Reiniciar:
   ```bash
   npm run dev
   ```

## Qué NO toca
- `.env`
- `database/seed-productos.sql`
- el render de las tarjetas del catálogo
- las fichas individuales

## Campos administrables desde CMS
### Página productos -> sección `intro`
- badge / nombre
- título
- texto introductorio

### Página productos -> sección `repuestos`
- badge / nombre
- título
- subtítulo
- contenido enriquecido

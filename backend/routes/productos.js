const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const authAdmin = require('../middleware/authAdmin');
const { slugify } = require('../models/helpers');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${slugify(base)}${ext}`);
  }
});

const upload = multer({ storage });

function parseNullableNumber(value, fallback = null) {
  if (value === undefined) return fallback;
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

function parseJsonField(rawValue, fallback) {
  if (rawValue === undefined) return fallback;
  if (!rawValue) return fallback;
  if (typeof rawValue === 'object') return rawValue;
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function parseGallery(value, fallback = []) {
  if (value === undefined) return fallback;
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE is_active = TRUE ORDER BY sort_order ASC, featured DESC, created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
});

router.get('/admin', authAdmin, async (_, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos admin', error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM products WHERE slug = $1 LIMIT 1`, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
});

router.post('/', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'El nombre del producto es obligatorio.' });

    const slug = slugify(body.slug || name);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (body.image_url || null);
    const parsedSpecs = parseJsonField(body.specs, {});
    const gallery = parseGallery(body.gallery_urls, []);

    const { rows } = await pool.query(
      `INSERT INTO products (
        name, slug, brand, category, status, sort_order, engine_cc, engine_type, cooling, transmission, start_type,
        suspension_front, suspension_rear, seat_height, weight_kg, stock, price, old_price,
        featured, short_description, description, image_url, gallery, specs, payment_link, brochure_url, is_active
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27
      ) RETURNING *`,
      [
        name,
        slug,
        body.brand || 'KAYO',
        body.category || 'Enduro',
        body.status || 'Consultar',
        parseNullableNumber(body.sort_order, 100),
        parseNullableNumber(body.engine_cc, null),
        body.engine_type || null,
        body.cooling || null,
        body.transmission || null,
        body.start_type || null,
        body.suspension_front || null,
        body.suspension_rear || null,
        body.seat_height || null,
        body.weight_kg || null,
        parseNullableNumber(body.stock, 0),
        parseNullableNumber(body.price, null),
        parseNullableNumber(body.old_price, null),
        parseBoolean(body.featured, false),
        body.short_description || null,
        body.description || null,
        imageUrl,
        JSON.stringify(gallery),
        parsedSpecs,
        body.payment_link || null,
        body.brochure_url || null,
        parseBoolean(body.is_active, true),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
});

router.put('/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const current = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ message: 'Producto no encontrado' });

    const base = current.rows[0];
    const body = req.body || {};
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (body.image_url !== undefined ? body.image_url : base.image_url);
    const parsedSpecs = body.specs !== undefined ? parseJsonField(body.specs, {}) : base.specs;
    const gallery = body.gallery_urls !== undefined ? parseGallery(body.gallery_urls, []) : base.gallery;
    const nextName = String(body.name || base.name || '').trim();

    const { rows } = await pool.query(
      `UPDATE products SET
        name=$1,
        slug=$2,
        brand=$3,
        category=$4,
        status=$5,
        sort_order=$6,
        engine_cc=$7,
        engine_type=$8,
        cooling=$9,
        transmission=$10,
        start_type=$11,
        suspension_front=$12,
        suspension_rear=$13,
        seat_height=$14,
        weight_kg=$15,
        stock=$16,
        price=$17,
        old_price=$18,
        featured=$19,
        short_description=$20,
        description=$21,
        image_url=$22,
        gallery=$23,
        specs=$24,
        payment_link=$25,
        brochure_url=$26,
        is_active=$27,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=$28
      RETURNING *`,
      [
        nextName,
        slugify(body.slug || nextName),
        body.brand !== undefined ? body.brand : base.brand,
        body.category !== undefined ? body.category : base.category,
        body.status !== undefined ? body.status : base.status,
        parseNullableNumber(body.sort_order, base.sort_order),
        parseNullableNumber(body.engine_cc, base.engine_cc),
        body.engine_type !== undefined ? body.engine_type : base.engine_type,
        body.cooling !== undefined ? body.cooling : base.cooling,
        body.transmission !== undefined ? body.transmission : base.transmission,
        body.start_type !== undefined ? body.start_type : base.start_type,
        body.suspension_front !== undefined ? body.suspension_front : base.suspension_front,
        body.suspension_rear !== undefined ? body.suspension_rear : base.suspension_rear,
        body.seat_height !== undefined ? body.seat_height : base.seat_height,
        body.weight_kg !== undefined ? body.weight_kg : base.weight_kg,
        parseNullableNumber(body.stock, base.stock),
        parseNullableNumber(body.price, base.price),
        parseNullableNumber(body.old_price, base.old_price),
        parseBoolean(body.featured, base.featured),
        body.short_description !== undefined ? body.short_description : base.short_description,
        body.description !== undefined ? body.description : base.description,
        imageUrl,
        JSON.stringify(gallery),
        parsedSpecs,
        body.payment_link !== undefined ? body.payment_link : base.payment_link,
        body.brochure_url !== undefined ? body.brochure_url : base.brochure_url,
        parseBoolean(body.is_active, base.is_active),
        req.params.id,
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
});

router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await pool.query(`UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;

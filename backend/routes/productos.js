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
    const {
      name, brand, category, status, sort_order, engine_cc, engine_type, cooling, transmission, start_type,
      suspension_front, suspension_rear, seat_height, weight_kg, stock, price, old_price,
      featured, short_description, description, specs, gallery_urls, payment_link, brochure_url
    } = req.body;

    const slug = slugify(name);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
    const parsedSpecs = specs ? JSON.parse(specs) : {};
    const gallery = gallery_urls ? gallery_urls.split('\n').map(item => item.trim()).filter(Boolean) : [];

    const { rows } = await pool.query(
      `INSERT INTO products (
        name, slug, brand, category, status, sort_order, engine_cc, engine_type, cooling, transmission, start_type,
        suspension_front, suspension_rear, seat_height, weight_kg, stock, price, old_price,
        featured, short_description, description, image_url, gallery, specs, payment_link, brochure_url
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
      ) RETURNING *`,
      [
        name,
        slug,
        brand || 'KAYO',
        category || 'Enduro',
        status || 'Consultar',
        Number(sort_order || 100),
        engine_cc || null,
        engine_type || null,
        cooling || null,
        transmission || null,
        start_type || null,
        suspension_front || null,
        suspension_rear || null,
        seat_height || null,
        weight_kg || null,
        stock || 0,
        price || null,
        old_price || null,
        featured === 'true' || featured === true,
        short_description || null,
        description || null,
        imageUrl,
        JSON.stringify(gallery),
        parsedSpecs,
        payment_link || null,
        brochure_url || null
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
    const body = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : body.image_url || base.image_url;
    const parsedSpecs = body.specs ? JSON.parse(body.specs) : base.specs;
    const gallery = body.gallery_urls
      ? body.gallery_urls.split('\n').map(item => item.trim()).filter(Boolean)
      : base.gallery;

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
        updated_at=CURRENT_TIMESTAMP
      WHERE id=$27
      RETURNING *`,
      [
        body.name || base.name,
        slugify(body.name || base.name),
        body.brand || base.brand,
        body.category || base.category,
        body.status || base.status,
        Number(body.sort_order ?? base.sort_order),
        body.engine_cc || base.engine_cc,
        body.engine_type || base.engine_type,
        body.cooling || base.cooling,
        body.transmission || base.transmission,
        body.start_type || base.start_type,
        body.suspension_front || base.suspension_front,
        body.suspension_rear || base.suspension_rear,
        body.seat_height || base.seat_height,
        body.weight_kg || base.weight_kg,
        body.stock ?? base.stock,
        body.price || base.price,
        body.old_price || base.old_price,
        body.featured === 'true' ? true : body.featured === 'false' ? false : base.featured,
        body.short_description || base.short_description,
        body.description || base.description,
        imageUrl,
        JSON.stringify(gallery),
        parsedSpecs,
        body.payment_link || base.payment_link,
        body.brochure_url || base.brochure_url,
        req.params.id
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

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

router.get('/', async (_, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM hero_slides WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener slides', error: error.message });
  }
});

router.get('/admin', authAdmin, async (_, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener slides admin', error: error.message });
  }
});

router.post('/', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, cta_label, cta_url, sort_order } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    const { rows } = await pool.query(
      `INSERT INTO hero_slides (title, subtitle, cta_label, cta_url, image_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        title || 'Allmate Motors',
        subtitle || 'Distribuidor oficial KAYO',
        cta_label || 'Ver catálogo',
        cta_url || 'productos.html',
        imageUrl,
        Number(sort_order || 1)
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear slide', error: error.message });
  }
});

router.put('/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const current = await pool.query(`SELECT * FROM hero_slides WHERE id = $1`, [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ message: 'Slide no encontrado' });

    const base = current.rows[0];
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || base.image_url;

    const { rows } = await pool.query(
      `UPDATE hero_slides SET
        title=$1,
        subtitle=$2,
        cta_label=$3,
        cta_url=$4,
        image_url=$5,
        sort_order=$6,
        is_active=$7,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=$8
      RETURNING *`,
      [
        req.body.title || base.title,
        req.body.subtitle || base.subtitle,
        req.body.cta_label || base.cta_label,
        req.body.cta_url || base.cta_url,
        imageUrl,
        Number(req.body.sort_order ?? base.sort_order),
        req.body.is_active === 'false' ? false : req.body.is_active === false ? false : true,
        req.params.id
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar slide', error: error.message });
  }
});

router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await pool.query(
      `UPDATE hero_slides SET is_active = FALSE, updated_at=CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );
    res.json({ message: 'Slide desactivado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar slide', error: error.message });
  }
});

module.exports = router;

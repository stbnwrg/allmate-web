const express = require('express');
const pool = require('../config/db');
const authAdmin = require('../middleware/authAdmin');
const { slugify } = require('../models/helpers');

const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM news WHERE is_active = TRUE ORDER BY published_at DESC, created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener noticias', error: error.message });
  }
});

router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, image_url, author, published_at } = req.body;
    const slug = slugify(title);
    const { rows } = await pool.query(
      `INSERT INTO news (title, slug, excerpt, content, image_url, author, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, slug, excerpt, content, image_url, author || 'Allmate Motors', published_at || new Date()]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear noticia', error: error.message });
  }
});

module.exports = router;

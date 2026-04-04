const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, slug, excerpt, content, image_url, author, published_at, is_active
       FROM news
       WHERE is_active = TRUE
       ORDER BY published_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener noticias', error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, slug, excerpt, content, image_url, author, published_at, is_active
       FROM news
       WHERE slug = $1 AND is_active = TRUE
       LIMIT 1`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Noticia no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener noticia', error: error.message });
  }
});

module.exports = router;

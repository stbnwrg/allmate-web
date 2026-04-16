const express = require('express');
const pool = require('../config/db');
const authAdmin = require('../middleware/authAdmin');
const { slugify } = require('../models/helpers');

const router = express.Router();

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

router.get('/admin', authAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, slug, excerpt, content, image_url, author, published_at, is_active
       FROM news
       ORDER BY published_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener noticias admin', error: error.message });
  }
});

router.post('/admin', authAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const title = String(body.title || '').trim();
    const content = String(body.content || '').trim();
    if (!title || !content) {
      return res.status(400).json({ message: 'Título y contenido son obligatorios.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO news (title, slug, excerpt, content, image_url, author, published_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, title, slug, excerpt, content, image_url, author, published_at, is_active`,
      [
        title,
        slugify(body.slug || title),
        body.excerpt || null,
        content,
        body.image_url || null,
        body.author || 'Allmate Motors',
        body.published_at || new Date().toISOString(),
        parseBoolean(body.is_active, true),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear noticia', error: error.message });
  }
});

router.put('/admin/:id', authAdmin, async (req, res) => {
  try {
    const current = await pool.query(`SELECT * FROM news WHERE id = $1 LIMIT 1`, [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ message: 'Noticia no encontrada' });
    const base = current.rows[0];
    const body = req.body || {};

    const nextTitle = String(body.title || base.title || '').trim();
    const nextContent = body.content !== undefined ? body.content : base.content;
    if (!nextTitle || !nextContent) {
      return res.status(400).json({ message: 'Título y contenido son obligatorios.' });
    }

    const { rows } = await pool.query(
      `UPDATE news SET
         title = $1,
         slug = $2,
         excerpt = $3,
         content = $4,
         image_url = $5,
         author = $6,
         published_at = $7,
         is_active = $8
       WHERE id = $9
       RETURNING id, title, slug, excerpt, content, image_url, author, published_at, is_active`,
      [
        nextTitle,
        slugify(body.slug || nextTitle),
        body.excerpt !== undefined ? body.excerpt : base.excerpt,
        nextContent,
        body.image_url !== undefined ? body.image_url : base.image_url,
        body.author !== undefined ? body.author : base.author,
        body.published_at !== undefined ? body.published_at : base.published_at,
        parseBoolean(body.is_active, base.is_active),
        req.params.id,
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar noticia', error: error.message });
  }
});

router.delete('/admin/:id', authAdmin, async (req, res) => {
  try {
    await pool.query(`UPDATE news SET is_active = FALSE WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Noticia desactivada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar noticia', error: error.message });
  }
});

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

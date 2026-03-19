require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');

const productosRoutes = require('./routes/productos');
const newsRoutes = require('./routes/news');
const contactoRoutes = require('./routes/contacto');
const pagosRoutes = require('./routes/pagos');
const authRoutes = require('./routes/auth');
const heroRoutes = require('./routes/hero');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'images')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/content', express.static(path.join(__dirname, '..', 'allmate-web-content')));

app.get('/api/health', async (_, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, message: 'API Allmate operativa' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/pagos', pagosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor Allmate en http://localhost:${PORT}`);
});

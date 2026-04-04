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
const cmsRoutes = require('./routes/cms');
const adminCmsRoutes = require('./routes/adminCms');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";
const seoRoutes = require("./routes/seo");

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
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
app.use('/api/cms', cmsRoutes);
app.use('/api/admin/cms', adminCmsRoutes);
app.use("/", seoRoutes);

app.listen(PORT, HOST, () => {
  console.log(`Servidor Allmate en puerto ${PORT}`);
});

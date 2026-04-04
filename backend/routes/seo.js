const express = require("express");
const router = express.Router();
const pool = require("../config/db");

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/robots.txt", async (req, res) => {
  const base = baseUrl(req);
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${base}/sitemap.xml`
  ].join("\n");
  res.type("text/plain").send(body);
});

router.get("/sitemap.xml", async (req, res) => {
  const base = baseUrl(req);
  const urls = new Map();
  const add = (loc, lastmod) => {
    if (!loc) return;
    urls.set(loc, lastmod || new Date().toISOString());
  };

  add(`${base}/`);
  add(`${base}/index.html`);
  add(`${base}/productos.html`);
  add(`${base}/ofertas.html`);
  add(`${base}/news.html`);
  add(`${base}/contacto.html`);

  try {
    const products = await pool.query(
      "SELECT slug, updated_at FROM products WHERE is_active = true ORDER BY updated_at DESC"
    );
    products.rows.forEach((row) => add(`${base}/producto.html?slug=${encodeURIComponent(row.slug)}`, row.updated_at));

    const news = await pool.query(
      "SELECT slug, published_at, created_at FROM news WHERE is_active = true ORDER BY published_at DESC NULLS LAST, created_at DESC"
    );
    news.rows.forEach((row) => add(`${base}/noticia.html?slug=${encodeURIComponent(row.slug)}`, row.published_at || row.created_at));
  } catch (error) {
    console.error("SEO sitemap warning:", error.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls.entries()].map(([loc, lastmod]) => `  <url>
    <loc>${esc(loc)}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
  </url>`).join("\n")}
</urlset>`;
  res.type("application/xml").send(xml);
});

module.exports = router;

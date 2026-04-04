const SITE = window.SITE_CONFIG || {};
const PRODUCTS = SITE.products || [];
const NEWS = (SITE.news || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
const DEFAULT_DOMAIN = window.location.origin;

function qs(selector, scope = document) { return scope.querySelector(selector); }
function qsa(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }
function toggleMobileMenu() { qs('#mobile-menu')?.classList.toggle('show'); }
window.toggleMobileMenu = toggleMobileMenu;

function currencyCLP(value) {
  if (!value || Number(value) <= 0) return 'Cotizar';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value));
}
function statusClass(status = '') {
  return String(status).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
}
function getCart() { try { return JSON.parse(localStorage.getItem('allmate_cart') || '[]'); } catch { return []; } }
function setCart(cart) { localStorage.setItem('allmate_cart', JSON.stringify(cart)); updateCartCount(); }
function updateCartCount() { const count = getCart().reduce((a, i) => a + Number(i.quantity || 0), 0); qsa('[data-cart-count]').forEach(n => n.textContent = count); }
window.getCart = getCart;
window.setCart = setCart;
window.updateCartCount = updateCartCount;
window.currencyCLP = currencyCLP;
function addToCart(product) {
  const cart = getCart();
  const item = cart.find(i => i.slug === product.slug);
  if (item) item.quantity += 1;
  else cart.push({ slug: product.slug, name: product.name, price: product.price || 0, image: product.image, quantity: 1 });
  setCart(cart);
  alert(`${product.name} agregado al carrito.`);
}
window.addToCart = addToCart;

function imageMarkup(product, eager = false) {
  if (!product.image) return `<div class="product-media product-media-empty"><span>Imagen pendiente</span></div>`;
  return `<div class="product-media"><img src="${product.image}" alt="${product.name}" loading="${eager ? 'eager' : 'lazy'}" onerror="this.closest('.product-media').classList.add('product-media-empty');this.remove();"></div>`;
}
function productUrl(slug) { return `producto.html?slug=${encodeURIComponent(slug)}`; }
function newsUrl(slug) { return `noticia.html?slug=${encodeURIComponent(slug)}`; }

function productCard(product, options = {}) {
  const old = product.old_price ? `<div class="old-price">${currencyCLP(product.old_price)}</div>` : '';
  const offer = product.old_price ? '<span class="tag-pill tag-offer">Oferta</span>' : '';
  return `
    <article class="product-card" data-category="${product.category}">
      ${imageMarkup(product, options.eager)}
      <div class="card-body">
        <div class="product-tags-row"><span class="tag-pill">${product.category}</span>${offer}<span class="status ${statusClass(product.status)}">${product.status}</span></div>
        <h3>${product.name}</h3>
        <p class="product-summary">${product.short}</p>
        <div class="price-row"><div><div class="price">${currencyCLP(product.price)}</div>${old}</div></div>
        <div class="product-actions solo"><a class="btn btn-full" href="${productUrl(product.slug)}">${options.offer ? 'Ver oferta' : 'Ficha técnica'}</a></div>
      </div>
    </article>`;
}

function renderCategories() {
  const mount = qs('#home-categories');
  if (!mount) return;
  mount.innerHTML = `
    <article class="category-card short-card">
      <img src="images/productos/t4-250/moto-concepcion-t4-250-1.webp" alt="Moto enduro KAYO disponible en Allmate Motors Biobío" loading="lazy">
      <div class="content">
        <span class="status disponible">Dirt Bike / Enduro</span>
        <h3>Enduro y nivel medio</h3>
        <p>Modelos para aprendizaje serio, trail y salto al siguiente escalón del off-road.</p>
        <a class="btn" href="productos.html?cat=Enduro">Ver modelos</a>
      </div>
    </article>
    <article class="category-card short-card">
      <img src="images/productos/tt160/moto-concepcion-tt160-1.webp" alt="Pit bike KAYO en Concepción y Biobío" loading="lazy">
      <div class="content">
        <span class="status disponible">Pit Bike</span>
        <h3>Iniciación y progresión</h3>
        <p>Motos compactas para riders jóvenes y quienes quieren entrar al mundo KAYO.</p>
        <a class="btn" href="productos.html?cat=Pit%20Bike">Ver modelos</a>
      </div>
    </article>
    <article class="category-card short-card">
      <img src="images/carrusel/allmate-kayo-biobio-atv-10.webp" alt="ATV y UTV KAYO en Biobío" loading="lazy">
      <div class="content">
        <span class="status disponible">ATV / UTV</span>
        <h3>Iniciación ATV / UTV</h3>
        <p>Línea de iniciación y entretenimiento para quienes buscan ATV y UTV KAYO bajo pedido.</p>
        <a class="btn" href="productos.html?cat=ATV%20%2F%20UTV">Ver iniciación</a>
      </div>
    </article>`;
}

function renderVisualMarquee() {
  const mount = qs('#visual-marquee');
  if (!mount) return;
  const items = [...(SITE.visualMarquee || []), ...(SITE.visualMarquee || [])].map(item => `
    <article class="visual-card visual-card-wide">
      <img src="${item.image}" alt="${item.alt}" loading="lazy">
      <div class="visual-card-copy"><span>${item.eyebrow}</span><strong>${item.title}</strong></div>
    </article>`).join('');
  mount.innerHTML = `<div class="visual-track visual-track-soft">${items}</div>`;
}

function renderOffers() {
  const mount = qs('#offer-highlight');
  if (!mount) return;
  const offers = (SITE.offers || []).length ? SITE.offers : PRODUCTS.filter(p => p.old_price);
  if (!offers.length) {
    mount.innerHTML = '';
    return;
  }
  const base = offers.length === 1 ? Array(5).fill(offers[0]) : [...offers];
  const source = [...base, ...base, ...base];
  mount.innerHTML = `
    <div class="offer-highlight-shell">
      <div class="offer-highlight-track">
        ${source.map(item => `
          <article class="offer-feature-card">
            <div class="offer-feature-media ${item.image ? '' : 'empty'}">
              ${item.image ? `<img src="${item.image}" alt="Oferta ${item.name}" loading="lazy">` : '<span>Imagen pendiente</span>'}
            </div>
            <div class="offer-feature-copy">
              <span class="offer-label">Oferta de la semana</span>
              <h3>${item.name}</h3>
              <p>${item.short}</p>
              <div class="offer-prices"><strong>${currencyCLP(item.price)}</strong>${item.old_price ? `<span>${currencyCLP(item.old_price)}</span>` : ''}</div>
              <a class="btn" href="${productUrl(item.slug)}">Ver oferta</a>
            </div>
          </article>`).join('')}
      </div>
    </div>`;
}

function renderProductsPage() {
  const mount = qs('#products-list');
  if (!mount) return;
  let currentFilter = new URLSearchParams(window.location.search).get('cat') || 'Todos';
  const filters = qsa('#product-filters .filter-pill');

  function paint() {
    const visible = currentFilter === 'Todos'
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === currentFilter);
    mount.innerHTML = visible.map((p, i) => productCard(p, { eager: i < 3 })).join('');
    filters.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === currentFilter));
  }

  filters.forEach(btn => btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    paint();
  }));

  if (!['Todos', 'Enduro', 'Pit Bike', 'Mini', 'ATV / UTV'].includes(currentFilter)) currentFilter = 'Todos';
  paint();
}

function renderNewsPreview() {
  const mount = qs('#home-news');
  if (!mount) return;
  mount.innerHTML = NEWS.slice(0, 3).map(item => `
    <article class="news-card">
      <a href="${newsUrl(item.slug)}" class="news-card-link">
        <img class="news-image" src="${item.hero}" alt="${item.title}" loading="lazy">
        <div class="card-body"><small>${new Date(item.date + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</small><h3>${item.title}</h3><p>${item.excerpt}</p></div>
      </a>
    </article>`).join('');
}
function renderNewsPage() {
  const mount = qs('#news-list');
  if (!mount) return;
  mount.innerHTML = NEWS.map(item => `
    <article class="news-card">
      <a href="${newsUrl(item.slug)}" class="news-card-link">
        <img class="news-image" src="${item.hero}" alt="${item.title}" loading="lazy">
        <div class="card-body"><small>${new Date(item.date + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</small><h3>${item.title}</h3><p>${item.excerpt}</p><span class="text-link">Leer noticia completa</span></div>
      </a>
    </article>`).join('');
}

function populateFooter() {
  qsa('[data-footer-description]').forEach(el => el.textContent = SITE.footerText || '');
  qsa('[data-payment-link]').forEach(el => el.href = SITE.payment.generalLink);
  qsa('[data-instagram-link]').forEach(el => el.href = SITE.contact.instagram);
  qsa('[data-instagram-label]').forEach(el => el.textContent = '@allmatemotors.cl');
  qsa('[data-whatsapp-link]').forEach(el => el.href = SITE.contact.whatsapp);
  qsa('[data-whatsapp-label]').forEach(el => el.textContent = SITE.contact.telephone);
  qsa('[data-contact-email]').forEach(el => el.textContent = SITE.contact.email);
}

function setupLoader() {
  document.body.classList.add('is-loading');
  const node = qs('[data-loader-progress]');
  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(99, progress + Math.ceil(Math.random() * 12));
    if (node) node.textContent = `${progress}%`;
  }, 100);
  window.addEventListener('load', () => {
    clearInterval(timer);
    if (node) node.textContent = '100%';
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      const loader = qs('.page-loader');
      if (loader) { loader.classList.add('hide'); setTimeout(() => loader.remove(), 450); }
    }, 220);
  });
}

function submitRepuestosForm(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const msg = `Hola Allmate, necesito cotizar un repuesto.%0A%0ANombre: ${encodeURIComponent(data.get('nombre') || '')}%0AModelo: ${encodeURIComponent(data.get('modelo') || '')}%0ATeléfono: ${encodeURIComponent(data.get('telefono') || '')}%0ACorreo: ${encodeURIComponent(data.get('correo') || '')}%0ATipo de repuesto: ${encodeURIComponent(data.get('tipo') || '')}%0ADetalle: ${encodeURIComponent(data.get('detalle') || '')}`;
  window.open(`https://wa.me/56992178719?text=${msg}`, '_blank');
}
window.submitRepuestosForm = submitRepuestosForm;

function injectJsonLd(data) {
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}
function setMetaDescription(text) {
  let meta = qs('meta[name="description"]');
  if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
  meta.setAttribute('content', text);
}

function renderProductDetail() {
  const mount = qs('#product-detail');
  if (!mount) return;
  const slug = new URLSearchParams(window.location.search).get('slug');
  const p = PRODUCTS.find(item => item.slug === slug) || PRODUCTS[0];
  document.title = `${p.name} en Concepción y Biobío | Precio, ficha técnica y oferta | Allmate Motors`;
  setMetaDescription(`Conoce la ${p.name} disponible en Allmate Motors. Revisa precio, ficha técnica, imágenes y atención directa para Coronel, Concepción y la Región del Biobío.`);
  const specs = [['Categoría', p.category], ['Cilindrada', p.cc], ['Motor', p.motor], ['Refrigeración', p.cooling], ['Transmisión', p.transmission], ['Arranque', p.start], ['Suspensión delantera', p.sf], ['Suspensión trasera', p.sr], ['Altura asiento', p.seat], ['Peso', p.weight], ['Frenos', p.frenos], ['Llantas', p.llantas], ['Potencia', p.potencia]].map(([l, v]) => `<div class="spec-item"><small>${l}</small><strong>${v}</strong></div>`).join('');
  const faq = (p.faq || []).map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const thumbs = (p.gallery || []).map(g => `<img src="${g}" alt="${p.name} imagen adicional" loading="lazy">`).join('');
  mount.innerHTML = `<div class="detail-gallery"><div class="detail-gallery-main">${p.image ? `<img src="${p.image}" alt="${p.name} en Allmate Motors" onerror="this.parentNode.innerHTML='<div class=\'product-media product-media-empty\'><span>Imagen pendiente</span></div>'">` : `<div class="product-media product-media-empty"><span>Imagen pendiente</span></div>`}</div><div class="detail-gallery-thumbs">${thumbs}</div></div><div class="detail-copy"><span class="badge detail-kicker">${p.category} · ${p.status}</span><h1 class="detail-title">${p.name}</h1><p class="detail-intro">${p.long}</p><div class="detail-price-box"><div class="detail-price">${currencyCLP(p.price)}</div>${p.old_price ? `<div class="detail-old">${currencyCLP(p.old_price)}</div>` : ''}</div><div class="detail-cta"><a class="btn" href="https://www.webpay.cl/form-pay/204308" target="_blank" rel="noopener">Pagar / reservar</a><a class="btn btn-dark" href="https://wa.me/56992178719?text=Hola%20Allmate%2C%20quiero%20cotizar%20la%20${encodeURIComponent(p.name)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a></div><div class="spec-grid">${specs}</div><div class="longtail-box"><h2>Contenido long-tail orientado a búsqueda local</h2><p>Esta ficha está pensada para consultas como <strong>${p.name} Concepción</strong>, <strong>${p.name} Biobío</strong>, <strong>precio ${p.name}</strong> y búsquedas de motos KAYO de gama media en la zona sur. La idea es concentrar información, precio y acción comercial en una sola URL.</p></div><div class="faq-box"><h2>Preguntas frecuentes</h2>${faq}</div></div>`;
  injectJsonLd({ "@context": "https://schema.org", "@type": "Product", "name": p.name, "image": [DEFAULT_DOMAIN + p.image, ...(p.gallery || []).map(g => DEFAULT_DOMAIN + g)], "description": p.long, "brand": { "@type": "Brand", "name": "KAYO" }, "sku": p.slug, "offers": { "@type": "Offer", "priceCurrency": "CLP", "price": String(p.price || 0), "availability": p.status === 'Disponible' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder', "url": window.location.href }, "category": p.category });
  injectJsonLd({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Inicio", "item": DEFAULT_DOMAIN + '/' }, { "@type": "ListItem", "position": 2, "name": "Productos", "item": DEFAULT_DOMAIN + '/productos.html' }, { "@type": "ListItem", "position": 3, "name": p.name, 'item': window.location.href }] });
}

function renderNewsDetail() {
  const mount = qs('#news-detail');
  if (!mount) return;
  const slug = new URLSearchParams(window.location.search).get('slug');
  const n = NEWS.find(item => item.slug === slug) || NEWS[0];
  document.title = `${n.title} | Allmate Motors`;
  setMetaDescription(n.excerpt);
  const paras = (n.content || []).map(p => `<p>${p}</p>`).join('');
  const gallery = (n.gallery || []).map((g, i) => `<img src="${g}" alt="${n.title} imagen ${i + 1}" loading="lazy">`).join('');
  const related = NEWS.filter(item => item.slug !== n.slug).map(item => `<a class="related-link" href="${newsUrl(item.slug)}"><strong>${item.title}</strong><span>${item.excerpt}</span></a>`).join('');
  mount.innerHTML = `<div class="article-hero"><img src="${n.hero}" alt="${n.title}" loading="eager"></div><article class="article-main article-box"><div class="article-meta">${new Date(n.date + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div><h1 class="article-title">${n.title}</h1><div class="article-body">${paras}<h2>Más contexto local</h2><p>Este tipo de contenido ayuda a reforzar señales de marca, cobertura territorial y búsquedas long-tail como motos KAYO Biobío, distribuidor KAYO Concepción o catálogo KAYO Coronel.</p></div><div class="article-gallery">${gallery}</div></article><aside class="article-side article-box"><h2>Más noticias</h2><div class="related-list">${related}</div></aside>`;
  injectJsonLd({ "@context": "https://schema.org", "@type": "Article", "headline": n.title, "datePublished": n.date, "dateModified": n.date, "description": n.excerpt, "image": [DEFAULT_DOMAIN + n.hero, ...(n.gallery || []).map(g => DEFAULT_DOMAIN + g)], "author": { "@type": "Organization", "name": "Allmate Motors" }, "publisher": { "@type": "Organization", "name": "Allmate Motors", "logo": { "@type": "ImageObject", "url": DEFAULT_DOMAIN + '/images/branding/logo-principal.jpeg' } }, "mainEntityOfPage": window.location.href });
  injectJsonLd({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Inicio", "item": DEFAULT_DOMAIN + '/' }, { "@type": "ListItem", "position": 2, "name": "News", "item": DEFAULT_DOMAIN + '/news.html' }, { "@type": "ListItem", "position": 3, "name": n.title, 'item': window.location.href }] });
}

function injectHomeSchema() {
  if (document.body.dataset.page !== 'home') return;
  injectJsonLd({ "@context": "https://schema.org", "@type": "LocalBusiness", "name": SITE.brand.name, "url": DEFAULT_DOMAIN + '/', "image": DEFAULT_DOMAIN + '/images/hero/hero-1.jpeg', "logo": DEFAULT_DOMAIN + '/images/branding/logo-principal.jpeg', "telephone": SITE.contact.telephone, "email": SITE.contact.email, "description": SITE.footerText, "address": { "@type": "PostalAddress", "streetAddress": "Calle Corcovado #991, Cerro Santa Elena", "addressLocality": "Coronel", "addressRegion": "Región del Biobío", "addressCountry": "CL" }, "areaServed": ["Coronel", "Concepción", "Gran Concepción", "Región del Biobío"], "sameAs": [SITE.contact.instagram] });
}

document.addEventListener('DOMContentLoaded', () => {
  setupLoader();
  updateCartCount();
  populateFooter();
  renderCategories();
  renderVisualMarquee();
  renderOffers();
  renderProductsPage();
  renderNewsPreview();
  renderNewsPage();
  renderProductDetail();
  renderNewsDetail();
  injectHomeSchema();
});

const API_URL = '/api';
const DEFAULT_PRODUCT_IMAGE = '/images/productos/product-placeholder.jpg';

function toggleMobileMenu() {
  document.getElementById('mobile-menu')?.classList.toggle('show');
}

function currencyCLP(value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value)) || Number(value) <= 0) {
    return 'Consultar';
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Number(value));
}

function safeImage(imageUrl) {
  return imageUrl || DEFAULT_PRODUCT_IMAGE;
}

function normalizeCategory(category = '') {
  return String(category).trim().toLowerCase();
}

function statusClass(status = '') {
  const value = normalizeCategory(status).replace(/\s+/g, '-');
  return value || 'consultar';
}

function getCart() {
  return JSON.parse(localStorage.getItem('allmate_cart') || '[]');
}

function setCart(cart) {
  localStorage.setItem('allmate_cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product) {
  const cart = getCart();
  const current = cart.find(item => item.id === product.id);

  if (current) {
    current.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      price: product.price || 0,
      quantity: 1
    });
  }

  setCart(cart);
  alert(`${product.name} agregado al carrito.`);
}

function updateCartCount() {
  const count = getCart().reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  document.querySelectorAll('[data-cart-count]').forEach(node => {
    node.textContent = count;
  });
}

async function fetchProducts() {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) return [];
  return res.json();
}

function buildSpecs(product) {
  const specs = product.specs || {};
  const rows = [
    ['Cilindrada', product.engine_cc ? `${product.engine_cc} cc` : null],
    ['Motor', product.engine_type],
    ['Refrigeración', product.cooling],
    ['Transmisión', product.transmission],
    ['Arranque', product.start_type],
    ['Suspensión delantera', product.suspension_front],
    ['Suspensión trasera', product.suspension_rear],
    ['Altura asiento', product.seat_height],
    ['Peso', product.weight_kg],
    ['Frenos', specs.frenos],
    ['Llantas', specs.llantas],
    ['Combustible', specs.combustible],
    ['Potencia', specs.potencia],
    ['Observación', specs.observacion]
  ].filter(([, value]) => value);

  return rows.map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`).join('');
}

function productCard(product) {
  const paymentUrl = product.payment_link || window.SITE_CONFIG.payment.generalLink;
  return `
    <article class="product-card" data-category="${product.category || ''}">
      <div class="product-media">
        <img src="${safeImage(product.image_url)}" alt="${product.name}">
        <div class="product-tags">
          <span class="tag-pill">${product.brand || 'KAYO'}</span>
          <span class="status ${statusClass(product.status)}">${product.status || 'Consultar'}</span>
        </div>
      </div>
      <div class="card-body">
        <small style="color:#b6b6b6; text-transform:uppercase; letter-spacing:.12em;">${product.category || 'Moto'}</small>
        <h3>${product.name}</h3>
        <p class="product-summary">${product.short_description || 'Moto cargada en catálogo. Completa la descripción desde el panel admin.'}</p>

        <div class="product-specs">
          <div class="spec-box"><small>Cilindrada</small><strong>${product.engine_cc ? `${product.engine_cc} cc` : 'Consultar'}</strong></div>
          <div class="spec-box"><small>Motor</small><strong>${product.engine_type || 'Consultar'}</strong></div>
          <div class="spec-box"><small>Transmisión</small><strong>${product.transmission || 'Consultar'}</strong></div>
          <div class="spec-box"><small>Arranque</small><strong>${product.start_type || 'Consultar'}</strong></div>
        </div>

        <details class="specs-accordion">
          <summary>Ver ficha técnica completa</summary>
          <div class="specs-accordion-body">
            <ul class="specs-list">${buildSpecs(product)}</ul>
            ${product.description ? `<p>${product.description}</p>` : ''}
            ${product.brochure_url ? `<p><a class="btn btn-ghost" href="${product.brochure_url}" target="_blank" rel="noopener">Abrir ficha PDF</a></p>` : ''}
          </div>
        </details>

        <div class="price-row">
          <div>
            <div class="price">${currencyCLP(product.price)}</div>
            ${product.old_price ? `<div class="old-price">${currencyCLP(product.old_price)}</div>` : ''}
          </div>
          <div style="text-align:right; color:#bdbdbd; font-size:.9rem;">${product.stock ? `${product.stock} en stock` : 'Stock por confirmar'}</div>
        </div>

        <div class="product-actions">
          <button class="btn" onclick='addToCart(${JSON.stringify(product)})'>Agregar al carrito</button>
          <a class="btn btn-dark" href="${paymentUrl}" target="_blank" rel="noopener">Pagar / reservar</a>
        </div>
      </div>
    </article>
  `;
}

async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;
  const products = await fetchProducts();
  const featured = products.filter(item => item.featured).slice(0, 6);
  container.innerHTML = featured.length
    ? featured.map(productCard).join('')
    : '<div class="empty-state">Todavía no hay modelos destacados. Súbelos desde el panel admin.</div>';
}

async function loadProductsPage() {
  const container = document.getElementById('products-list');
  if (!container) return;

  const products = await fetchProducts();
  const buttons = document.querySelectorAll('.filter-btn');
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('cat');

  function render(category = 'all') {
    const filtered = category === 'all'
      ? products
      : products.filter(item => normalizeCategory(item.category) === normalizeCategory(category));

    container.innerHTML = filtered.length
      ? filtered.map(productCard).join('')
      : '<div class="empty-state">No encontramos modelos en esta categoría.</div>';
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      render(button.dataset.category);
    });

    if (initialCategory && normalizeCategory(button.dataset.category) === normalizeCategory(initialCategory)) {
      button.classList.add('active');
    } else if (!initialCategory && button.dataset.category === 'all') {
      button.classList.add('active');
    } else if (initialCategory) {
      button.classList.remove('active');
    }
  });

  render(initialCategory || 'all');
}

async function loadNewsHome() {
  const homeContainer = document.getElementById('home-news');
  const listContainer = document.getElementById('news-list');
  if (!homeContainer && !listContainer) return;

  const res = await fetch(`${API_URL}/news`);
  const items = res.ok ? await res.json() : [];

  const html = items.length
    ? items.map(item => `
        <article class="news-card">
          <img class="news-image" src="${safeImage(item.image_url)}" alt="${item.title}">
          <div class="card-body">
            <small>${new Date(item.published_at).toLocaleDateString('es-CL')}</small>
            <h3>${item.title}</h3>
            <p>${item.excerpt || 'Sin extracto todavía.'}</p>
          </div>
        </article>
      `).join('')
    : '<div class="empty-state">La estructura de noticias quedó lista, pero todavía no hay publicaciones cargadas.</div>';

  if (homeContainer) homeContainer.innerHTML = html;
  if (listContainer) listContainer.innerHTML = html;
}

async function setupHeroSlider() {
  const heroRoot = document.getElementById('hero-slides');
  if (!heroRoot) return;

  const res = await fetch(`${API_URL}/hero`);
  const slides = res.ok ? await res.json() : [];
  const finalSlides = slides.length ? slides : window.SITE_CONFIG.heroFallback;

  heroRoot.innerHTML = finalSlides.map((slide, index) => `
    <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${safeImage(slide.image_url)}')"></div>
  `).join('');

  let active = 0;
  const title = document.getElementById('hero-title');
  const subtitle = document.getElementById('hero-subtitle');
  const cta = document.getElementById('hero-cta');

  function applySlide(index) {
    const slide = finalSlides[index];
    const nodes = heroRoot.querySelectorAll('.hero-slide');
    nodes.forEach((node, nodeIndex) => node.classList.toggle('active', nodeIndex === index));
    if (title) title.textContent = slide.title || 'Allmate Motors';
    if (subtitle) subtitle.textContent = slide.subtitle || '';
    if (cta) {
      cta.textContent = slide.cta_label || 'Ver catálogo';
      cta.href = slide.cta_url || 'productos.html';
    }
  }

  applySlide(0);
  if (finalSlides.length > 1) {
    setInterval(() => {
      active = (active + 1) % finalSlides.length;
      applySlide(active);
    }, 4800);
  }
}

function populateContactBlocks() {
  const config = window.SITE_CONFIG;
  const whatsappUrl = `https://wa.me/${config.contact.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(config.contact.whatsappText)}`;

  document.querySelectorAll('#contact-address').forEach(node => node.textContent = config.contact.address);
  document.querySelectorAll('#contact-whatsapp').forEach(node => node.textContent = config.contact.whatsappLabel);
  document.querySelectorAll('#contact-email').forEach(node => node.textContent = config.contact.email);
  document.querySelectorAll('#contact-hours').forEach(node => node.textContent = config.contact.hours);
  document.querySelectorAll('#map-link').forEach(node => node.href = config.contact.mapUrl);
  document.querySelectorAll('#wa-link').forEach(node => node.href = whatsappUrl);
  document.querySelectorAll('#email-link').forEach(node => node.href = `mailto:${config.contact.email}`);
  document.querySelectorAll('#map-embed').forEach(node => node.src = config.contact.mapEmbed);
  document.querySelectorAll('#footer-instagram').forEach(node => {
    node.href = config.contact.instagram;
    node.textContent = `Instagram ${config.contact.instagramLabel}`;
  });
  document.querySelectorAll('#footer-facebook').forEach(node => {
    node.href = config.contact.facebook;
    node.textContent = config.contact.facebookLabel;
  });
  document.querySelectorAll('#footer-payment').forEach(node => {
    node.href = config.payment.generalLink;
    node.textContent = `Pagar con ${config.payment.provider}`;
  });
  document.querySelectorAll('#hero-whatsapp').forEach(node => node.href = whatsappUrl);
  const desc = document.getElementById('footer-description');
  if (desc) desc.textContent = config.contact.description;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  populateContactBlocks();
  setupHeroSlider();
  loadFeaturedProducts();
  loadProductsPage();
  loadNewsHome();
});

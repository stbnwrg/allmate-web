const API_URL = '/api';
const state = { products: [], news: [] };

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

function normalizeCategory(category = '') {
  return String(category).trim().toLowerCase();
}

function statusClass(status = '') {
  const value = normalizeCategory(status).replace(/[^a-z0-9]+/g, '-');
  return value || 'consultar';
}

function getCart() {
  return JSON.parse(localStorage.getItem('allmate_cart') || '[]');
}

function setCart(cart) {
  localStorage.setItem('allmate_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  document.querySelectorAll('[data-cart-count]').forEach(node => {
    node.textContent = count;
  });
}

function safeImage(imageUrl, fallback = '') {
  return imageUrl || fallback;
}

function getMediaOverride(slug) {
  return window.SITE_CONFIG.productMedia?.[slug] || null;
}

function getProductMedia(product) {
  const override = getMediaOverride(product.slug);
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const merged = [];

  if (override?.primary) merged.push(override.primary);
  if (product.image_url) merged.push(product.image_url);
  (override?.gallery || []).forEach(image => merged.push(image));
  gallery.forEach(image => merged.push(image));

  return [...new Set(merged.filter(Boolean))];
}

function hydrateProduct(product = {}) {
  const override = window.SITE_CONFIG.productOverrides?.[product.slug] || {};
  return {
    ...product,
    ...override,
    image_url: override.image_url || getMediaOverride(product.slug)?.primary || product.image_url,
    gallery: override.gallery || getMediaOverride(product.slug)?.gallery || product.gallery || []
  };
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const apiProducts = res.ok ? await res.json() : [];
    const hydrated = apiProducts.map(hydrateProduct);
    const virtual = (window.SITE_CONFIG.virtualProducts || []).map(hydrateProduct);
    state.products = [...hydrated, ...virtual];
  } catch (error) {
    state.products = (window.SITE_CONFIG.virtualProducts || []).map(hydrateProduct);
  }
  return state.products;
}

function addToCartByKey(key) {
  const product = state.products.find(item => String(item.id || item.slug) === String(key));
  if (!product) return;

  const cart = getCart();
  const current = cart.find(item => String(item.id) === String(product.id || product.slug));

  if (current) {
    current.quantity += 1;
  } else {
    cart.push({
      id: product.id || product.slug,
      slug: product.slug,
      name: product.name,
      image_url: getProductMedia(product)[0] || '',
      price: product.price || 0,
      quantity: 1
    });
  }

  setCart(cart);
  alert(`${product.name} agregado al carrito.`);
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

  return rows.length
    ? rows.map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`).join('')
    : '<li><strong>Ficha técnica:</strong> Próximamente cargaremos más datos para este modelo.</li>';
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function productCard(product) {
  const media = getProductMedia(product);
  const paymentUrl = product.payment_link || window.SITE_CONFIG.payment.generalLink;
  const cardKey = String(product.id || product.slug);
  const detailsId = `specs-${product.slug || cardKey}`;
  const hasOffer = Number(product.old_price || 0) > Number(product.price || 0) || product.is_offer;
  const offerTag = hasOffer ? `<span class="tag-pill tag-offer">${product.offer_label || 'Oferta'}</span>` : '';

  return `
    <article class="product-card" data-category="${escapeHtml(product.category || '')}">
      <div class="product-media ${media.length ? '' : 'product-media-empty'}">
        ${media.length ? `
          <div class="product-gallery" data-gallery>
            <div class="product-gallery-track">
              ${media.map((image, index) => `
                <div class="product-gallery-slide ${index === 0 ? 'is-active' : ''}" data-slide>
                  <img src="${image}" alt="${escapeHtml(product.name)} - vista ${index + 1}" loading="lazy">
                </div>
              `).join('')}
            </div>
            ${media.length > 1 ? `
              <button class="gallery-control prev" type="button" data-gallery-prev aria-label="Imagen anterior">‹</button>
              <button class="gallery-control next" type="button" data-gallery-next aria-label="Siguiente imagen">›</button>
              <div class="gallery-dots">${media.map((_, index) => `<button type="button" class="gallery-dot ${index === 0 ? 'is-active' : ''}" data-gallery-dot="${index}"></button>`).join('')}</div>
            ` : ''}
          </div>
        ` : `
          <div class="product-media-placeholder">
            <span>Imagen pendiente</span>
          </div>
        `}
        <div class="product-tags">
          <span class="tag-pill">${escapeHtml(product.brand || 'KAYO')}</span>
          <span class="status ${statusClass(product.status)}">${escapeHtml(product.status || 'Consultar')}</span>
          ${offerTag}
        </div>
      </div>

      <div class="product-ficha-row">
        <button class="btn btn-dark btn-ficha" type="button" data-toggle-specs="${detailsId}">Ficha técnica</button>
      </div>

      <div class="card-body">
        <small class="eyebrow">${escapeHtml(product.category || 'Moto')}</small>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="product-summary">${escapeHtml(product.short_description || 'Modelo disponible para atención comercial y carga técnica progresiva.')}</p>

        <div class="product-specs compact">
          <div class="spec-box"><small>Cilindrada</small><strong>${product.engine_cc ? `${product.engine_cc} cc` : 'Consultar'}</strong></div>
          <div class="spec-box"><small>Motor</small><strong>${escapeHtml(product.engine_type || 'Consultar')}</strong></div>
        </div>

        <details class="specs-accordion" id="${detailsId}">
          <summary>Ver detalle completo</summary>
          <div class="specs-accordion-body">
            <ul class="specs-list">${buildSpecs(product)}</ul>
            ${product.description ? `<p>${escapeHtml(product.description)}</p>` : ''}
            ${product.brochure_url ? `<p><a class="btn btn-ghost" href="${product.brochure_url}" target="_blank" rel="noopener">Abrir ficha PDF</a></p>` : ''}
          </div>
        </details>

        <div class="price-row">
          <div>
            <div class="price">${currencyCLP(product.price)}</div>
            ${hasOffer ? `<div class="old-price">${currencyCLP(product.old_price)}</div>` : ''}
          </div>
          <div class="stock-copy">${product.stock ? `${product.stock} en stock` : 'Stock por confirmar'}</div>
        </div>

        <div class="product-actions">
          <button class="btn" type="button" data-add-cart="${escapeHtml(cardKey)}">Agregar al carrito</button>
          <a class="btn btn-dark" href="${paymentUrl}" target="_blank" rel="noopener">Pagar / reservar</a>
        </div>
      </div>
    </article>
  `;
}

function setGalleryIndex(gallery, index) {
  const slides = [...gallery.querySelectorAll('[data-slide]')];
  const dots = [...gallery.querySelectorAll('[data-gallery-dot]')];
  if (!slides.length) return;
  const nextIndex = (index + slides.length) % slides.length;
  gallery.dataset.index = nextIndex;
  slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === nextIndex));
  dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === nextIndex));
}

function bindDynamicUI(scope = document) {
  scope.querySelectorAll('[data-add-cart]').forEach(button => {
    button.onclick = () => addToCartByKey(button.dataset.addCart);
  });

  scope.querySelectorAll('[data-toggle-specs]').forEach(button => {
    button.onclick = () => {
      const target = document.getElementById(button.dataset.toggleSpecs);
      if (!target) return;
      target.open = !target.open;
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
  });

  scope.querySelectorAll('[data-gallery]').forEach(gallery => {
    gallery.dataset.index = gallery.dataset.index || '0';
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    prev && (prev.onclick = () => setGalleryIndex(gallery, Number(gallery.dataset.index || 0) - 1));
    next && (next.onclick = () => setGalleryIndex(gallery, Number(gallery.dataset.index || 0) + 1));
    gallery.querySelectorAll('[data-gallery-dot]').forEach(dot => {
      dot.onclick = () => setGalleryIndex(gallery, Number(dot.dataset.galleryDot));
    });
  });
}

function buildEmptyState(category = 'all') {
  if (normalizeCategory(category) === 'atv') {
    return `
      <div class="empty-state empty-state-rich">
        <h3>ATV y UTV en evaluación comercial</h3>
        <p>La línea ATV/UTV se puede trabajar bajo pedido. Déjanos tu consulta y te ayudamos a encontrar el formato correcto para tu necesidad.</p>
        <a class="btn" href="contacto.html?tipo=ATV%20/%20UTV">Consultar ATV / UTV</a>
      </div>
    `;
  }
  return '<div class="empty-state">No encontramos modelos en esta categoría. Cambia el filtro o escríbenos para una búsqueda más específica.</div>';
}

function sortNewsByDate(items = []) {
  return [...items].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
}

async function loadNewsHome() {
  const homeContainer = document.getElementById('home-news');
  const listContainer = document.getElementById('news-list');
  if (!homeContainer && !listContainer) return;

  let items = [];
  try {
    const res = await fetch(`${API_URL}/news`);
    items = res.ok ? await res.json() : [];
  } catch (_) {
    items = [];
  }

  if (!items.length) {
    items = window.SITE_CONFIG.newsFallback || [];
  }

  items = sortNewsByDate(items);
  state.news = items;

  const html = items.length
    ? items.map(item => `
        <article class="news-card">
          <img class="news-image" src="${safeImage(item.image_url)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <div class="card-body">
            <small>${new Date(item.published_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</small>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt || 'Sin extracto todavía.')}</p>
          </div>
        </article>
      `).join('')
    : '<div class="empty-state">Todavía no hay noticias publicadas.</div>';

  if (homeContainer) homeContainer.innerHTML = html;
  if (listContainer) listContainer.innerHTML = html;
}

async function setupHeroSlider() {
  const heroRoot = document.getElementById('hero-slides');
  if (!heroRoot) return;

  let slides = [];
  try {
    const res = await fetch(`${API_URL}/hero`);
    slides = res.ok ? await res.json() : [];
  } catch (_) {
    slides = [];
  }

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

function buildOfferPanel(product) {
  if (!product) return '<div class="empty-state">Todavía no hay una oferta activa cargada.</div>';
  const image = getProductMedia(product)[0] || '';
  return `
    <div class="offer-panel offer-panel-priority">
      <div class="offer-visual ${image ? '' : 'offer-visual-empty'}">
        ${image ? `<img src="${image}" alt="${escapeHtml(product.name)} en oferta" loading="lazy">` : '<div class="product-media-placeholder"><span>Imagen pendiente</span></div>'}
      </div>
      <div class="offer-copy">
        <span class="badge">Oferta de la semana</span>
        <h2 class="section-title">${escapeHtml(product.name)}</h2>
        <p class="section-lead">${escapeHtml(product.short_description || 'Aprovecha un modelo destacado con precio promocional y contacto inmediato.')}</p>
        <div class="offer-price-row">
          <div class="price">${currencyCLP(product.price)}</div>
          ${product.old_price ? `<div class="old-price">${currencyCLP(product.old_price)}</div>` : ''}
        </div>
        <div class="hero-actions">
          <a class="btn" href="ofertas.html">Ver ofertas</a>
          <a class="btn btn-dark" href="${product.payment_link || window.SITE_CONFIG.payment.generalLink}" target="_blank" rel="noopener">Reservar ahora</a>
        </div>
      </div>
    </div>
  `;
}

function getOfferProducts(products = []) {
  const offers = products.filter(item => Number(item.old_price || 0) > Number(item.price || 0) || item.is_offer);
  if (offers.length) return offers;
  return [hydrateProduct(window.SITE_CONFIG.offerFallback)].filter(Boolean);
}

async function loadOfferHighlight() {
  const highlight = document.getElementById('offer-highlight');
  const offersList = document.getElementById('offers-list');
  if (!highlight && !offersList) return;

  const products = state.products.length ? state.products : await fetchProducts();
  const offers = getOfferProducts(products);

  if (highlight) {
    highlight.innerHTML = buildOfferPanel(offers[0]);
  }

  if (offersList) {
    offersList.innerHTML = offers.length
      ? offers.map(productCard).join('')
      : '<div class="empty-state">No hay ofertas activas por ahora.</div>';
    bindDynamicUI(offersList);
  }
}

function populateAboutSection() {
  document.querySelectorAll('[data-branch-name]').forEach(node => node.textContent = window.SITE_CONFIG.contact.branchName);
  document.querySelectorAll('[data-coverage]').forEach(node => node.textContent = window.SITE_CONFIG.contact.coverage);
  document.querySelectorAll('[data-history]').forEach(node => node.textContent = window.SITE_CONFIG.contact.history);
  document.querySelectorAll('[data-story]').forEach(node => node.textContent = window.SITE_CONFIG.contact.story);
}

function populateContactBlocks() {
  const config = window.SITE_CONFIG;
  const whatsappUrl = `https://wa.me/${config.contact.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(config.contact.whatsappText)}`;

  document.querySelectorAll('[data-contact-address]').forEach(node => node.textContent = config.contact.address);
  document.querySelectorAll('[data-contact-whatsapp]').forEach(node => node.textContent = config.contact.whatsappLabel);
  document.querySelectorAll('[data-contact-email]').forEach(node => node.textContent = config.contact.email);
  document.querySelectorAll('[data-contact-hours]').forEach(node => node.textContent = config.contact.hours);
  document.querySelectorAll('[data-map-link]').forEach(node => node.href = config.contact.mapUrl);
  document.querySelectorAll('[data-wa-link]').forEach(node => node.href = whatsappUrl);
  document.querySelectorAll('[data-email-link]').forEach(node => node.href = `mailto:${config.contact.email}`);
  document.querySelectorAll('[data-map-embed]').forEach(node => node.src = config.contact.mapEmbed);
  document.querySelectorAll('[data-instagram-link]').forEach(node => {
    node.href = config.contact.instagram;
    const label = node.querySelector('[data-instagram-label]');
    if (label) label.textContent = config.contact.instagramLabel;
  });
  document.querySelectorAll('[data-facebook-link]').forEach(node => {
    node.href = config.contact.facebook;
    node.textContent = config.contact.facebookLabel;
  });
  document.querySelectorAll('[data-payment-link]').forEach(node => {
    node.href = config.payment.generalLink;
    node.textContent = `Pagar con ${config.payment.provider}`;
  });
  document.querySelectorAll('[data-hero-wa]').forEach(node => node.href = whatsappUrl);
  document.querySelectorAll('[data-footer-description]').forEach(node => node.textContent = config.contact.description);
}

function buildModelOptions() {
  const products = state.products.filter(item => !['repuestos'].includes(normalizeCategory(item.category)));
  return products.map(product => `<option value="${escapeHtml(product.name)}"></option>`).join('');
}

function fillModelDatalists() {
  const options = buildModelOptions();
  document.querySelectorAll('[data-model-options]').forEach(node => {
    node.innerHTML = options;
  });
}

function bindLeadForms() {
  document.querySelectorAll('[data-lead-form]').forEach(form => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const type = form.dataset.formType || 'general';
      const alertBox = form.querySelector('.form-alert');
      const name = form.querySelector('[name="name"]')?.value || '';
      const email = form.querySelector('[name="email"]')?.value || '';
      const phone = form.querySelector('[name="phone"]')?.value || '';
      const model = form.querySelector('[name="model"]')?.value || 'No indicado';
      const inquiryType = form.querySelector('[name="inquiry_type"]')?.value || type;
      const details = form.querySelector('[name="message"]')?.value || '';
      const subject = form.querySelector('[name="subject"]')?.value || (type === 'repuestos' ? 'Cotización de repuesto' : 'Consulta comercial Allmate');

      const payload = {
        name,
        email,
        phone,
        subject,
        message: `Tipo de consulta: ${inquiryType}\nModelo: ${model}\nDetalle: ${details}`
      };

      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (alertBox) {
        alertBox.className = `alert show ${res.ok ? 'success' : 'error'} form-alert`;
        alertBox.textContent = res.ok ? 'Consulta enviada correctamente. Te responderemos por correo o WhatsApp.' : (data.message || 'No se pudo enviar la consulta.');
      }
      if (res.ok) form.reset();
    });
  });
}

function prefillFormFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const model = params.get('modelo');
  const tipo = params.get('tipo');
  if (model) {
    document.querySelectorAll('[name="model"]').forEach(node => node.value = model);
  }
  if (tipo) {
    document.querySelectorAll('[name="inquiry_type"]').forEach(node => {
      if ([...node.options].some(option => normalizeCategory(option.value) === normalizeCategory(tipo))) {
        node.value = tipo;
      }
    });
  }
}

function renderVisualMarquee() {
  const root = document.querySelector('[data-visual-marquee]');
  const track = document.querySelector('[data-visual-marquee-track]');
  if (!root || !track) return;

  const items = window.SITE_CONFIG.homeScrollImages || [];
  if (!items.length) return;

  const buildItem = (item) => `
    <figure class="visual-marquee-item ${item.wide ? 'is-wide' : ''}">
      <img src="${item.image_url}" alt="${escapeHtml(item.alt || 'KAYO Allmate Motors Biobío')}" loading="lazy">
    </figure>
  `;

  track.innerHTML = [...items, ...items].map(buildItem).join('');
}

async function loadProductsPage() {
  const container = document.getElementById('products-list');
  if (!container) return;

  const products = (state.products.length ? state.products : await fetchProducts()).filter(item => normalizeCategory(item.category) !== 'repuestos');
  const buttons = document.querySelectorAll('.filter-btn');
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('cat');

  function render(category = 'all') {
    const filtered = category === 'all'
      ? products
      : products.filter(item => normalizeCategory(item.category) === normalizeCategory(category));

    container.innerHTML = filtered.length
      ? filtered.map(productCard).join('')
      : buildEmptyState(category);
    bindDynamicUI(container);
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
  fillModelDatalists();
}

function startLoader() {
  const loader = document.getElementById('site-loader');
  const number = loader?.querySelector('[data-loader-number]');
  if (!loader || !number) return;

  document.body.classList.add('is-loading');
  let progress = 7;
  number.textContent = `${progress}%`;

  const timer = setInterval(() => {
    if (progress < 93) {
      progress += Math.floor(Math.random() * 6) + 1;
      if (progress > 93) progress = 93;
      number.textContent = `${progress}%`;
    }
  }, 110);

  window.addEventListener('load', () => {
    clearInterval(timer);
    let finalProgress = progress;
    const finish = setInterval(() => {
      finalProgress += 3;
      if (finalProgress >= 100) {
        finalProgress = 100;
        number.textContent = '100%';
        clearInterval(finish);
        loader.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
        setTimeout(() => loader.remove(), 520);
      } else {
        number.textContent = `${finalProgress}%`;
      }
    }, 18);
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  startLoader();
  updateCartCount();
  populateContactBlocks();
  populateAboutSection();
  setupHeroSlider();
  await fetchProducts();
  await loadOfferHighlight();
  renderVisualMarquee();
  await loadProductsPage();
  await loadNewsHome();
  fillModelDatalists();
  bindLeadForms();
  prefillFormFromQuery();
});

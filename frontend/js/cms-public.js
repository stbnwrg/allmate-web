(function () {
  const PAGE = document.body?.dataset?.page;
  if (!PAGE) return;

  function qs(sel, scope = document) { return scope.querySelector(sel); }
  function qsa(sel, scope = document) { return Array.from(scope.querySelectorAll(sel)); }
  function escapeHtml(v = '') {
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  function settingsMap(settings) {
    return Object.values(settings || {}).reduce((acc, group) => Object.assign(acc, group), {});
  }
  function ensureMeta(name, content) {
    if (!content) return;
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
  function injectJsonLd(id, data) {
    if (!data) return;
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
  function byKey(sections) {
    return (sections || []).reduce((acc, item) => {
      acc[item.section_key] = item;
      return acc;
    }, {});
  }
  function formatDate(date) {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function sectionItems(section) {
    return (section?.items || [])
      .filter(item => item.is_active)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function applyPageSeo(page) {
    if (!page) return;
    if (page.seo_title) document.title = page.seo_title;
    if (page.seo_description) ensureMeta('description', page.seo_description);
    if (page.seo_robots) ensureMeta('robots', page.seo_robots);
    if (page.seo_canonical) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = page.seo_canonical;
    }
  }

  function applySettings(settings) {
    const flat = settingsMap(settings);
    qsa('[data-footer-description]').forEach(el => { if (flat.footer_text) el.textContent = flat.footer_text; });
    qsa('[data-whatsapp-label]').forEach(el => { if (flat.site_phone) el.textContent = flat.site_phone; });
    qsa('[data-whatsapp-link]').forEach(el => { if (flat.site_whatsapp) el.href = flat.site_whatsapp; });
    qsa('[data-contact-email]').forEach(el => { if (flat.site_email) el.textContent = flat.site_email; });
    qsa('[data-contact-email-link]').forEach(el => { if (flat.site_email) el.href = `mailto:${flat.site_email}`; });
    qsa('[data-instagram-link]').forEach(el => { if (flat.site_instagram) el.href = flat.site_instagram; });
    qsa('[data-instagram-label]').forEach(el => { if (flat.site_instagram_label) el.textContent = flat.site_instagram_label; });
    qsa('[data-branch-name]').forEach(el => { if (flat.site_address) el.textContent = flat.site_address; });
    qsa('[data-payment-link]').forEach(el => { if (flat.general_payment_link) el.href = flat.general_payment_link; });
    return flat;
  }

  function renderHero(section, settings) {
    if (!section || !qs('#cms-hero-title')) return;
    if (qs('#cms-hero-badge')) qs('#cms-hero-badge').textContent = section.name || 'Distribuidor KAYO en Concepción y Biobío';
    if (qs('#cms-hero-title')) qs('#cms-hero-title').textContent = section.title || '';
    if (qs('#cms-hero-subtitle')) qs('#cms-hero-subtitle').textContent = section.subtitle || section.content || '';

    const activeSlide = sectionItems(section).find(item => item.image_url);
    if (activeSlide && qs('#cms-hero-background')) {
      qs('#cms-hero-background').style.backgroundImage = `url('${activeSlide.image_url}')`;
      qs('#cms-hero-background').style.backgroundSize = 'cover';
      qs('#cms-hero-background').style.backgroundPosition = 'center';
      if (activeSlide.button_label && qs('#cms-hero-cta-primary')) qs('#cms-hero-cta-primary').textContent = activeSlide.button_label;
      if (activeSlide.button_url && qs('#cms-hero-cta-primary')) qs('#cms-hero-cta-primary').setAttribute('href', activeSlide.button_url);
    }

    const stripMount = qs('#cms-hero-strip');
    const stripItems = sectionItems(section);
    if (stripMount && stripItems.length) {
      stripMount.innerHTML = stripItems.map((item, index) => `
        <div class="strip-item">
          <div class="strip-icon">${String(index + 1).padStart(2, '0')}</div>
          <div>
            <strong>${escapeHtml(item.title || '')}</strong>
            <span>${escapeHtml(item.content || item.subtitle || '')}</span>
          </div>
        </div>`).join('');
    }

    injectJsonLd('cms-home-localbusiness', {
      '@context': 'https://schema.org',
      '@type': 'MotorcycleDealer',
      name: settings.business_name || 'Allmate Motors',
      url: window.location.origin + '/',
      telephone: settings.site_phone || '',
      email: settings.site_email || '',
      description: section.content || section.subtitle || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.site_address || '',
        addressLocality: 'Coronel',
        addressRegion: settings.site_region || 'Región del Biobío',
        addressCountry: 'CL'
      },
      areaServed: ['Coronel', 'Concepción', 'Gran Concepción', settings.site_region || 'Región del Biobío'],
      sameAs: [settings.site_instagram || ''].filter(Boolean)
    });
  }

  function renderOffersHome(section) {
    if (!section) return;
    if (qs('#cms-offers-badge')) qs('#cms-offers-badge').textContent = section.name || 'Ofertas de la semana';
    if (qs('#cms-offers-title')) qs('#cms-offers-title').textContent = section.title || '';
    if (qs('#cms-offers-subtitle')) qs('#cms-offers-subtitle').textContent = section.subtitle || section.content || '';

    const mount = qs('#offer-highlight');
    const items = sectionItems(section);
    if (!mount || !items.length) return;

    const cards = items.map(item => {
      const currentPrice = item.meta?.price || item.price || item.subtitle || '';
      const oldPrice = item.meta?.old_price || item.meta?.oldPrice || '';
      const ctaLabel = item.button_label || 'Ver oferta';
      const ctaUrl = item.button_url || 'ofertas.html';
      return `
        <article class="offer-feature-card">
          <div class="offer-feature-media ${item.image_url ? '' : 'empty'}">
            ${item.image_url ? `<img src="${item.image_url}" alt="${escapeHtml(item.image_alt || item.title || 'Oferta Allmate Motors')}" loading="lazy">` : '<span>Imagen pendiente</span>'}
          </div>
          <div class="offer-feature-copy">
            <span class="offer-label">${escapeHtml(item.tag || section.name || 'Oferta de la semana')}</span>
            <h3>${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.content || item.subtitle || '')}</p>
            <div class="offer-prices">
              ${currentPrice ? `<strong>${escapeHtml(currentPrice)}</strong>` : ''}
              ${oldPrice ? `<span>${escapeHtml(oldPrice)}</span>` : ''}
            </div>
            <a class="btn" href="${ctaUrl}">${escapeHtml(ctaLabel)}</a>
          </div>
        </article>`;
    });

    mount.innerHTML = `
      <div class="offer-highlight-shell">
        <div class="offer-highlight-track">
          ${[...cards, ...cards].join('')}
        </div>
      </div>`;
  }

  function renderCategories(section) {
    if (!section) return;
    if (qs('#cms-categories-badge')) qs('#cms-categories-badge').textContent = section.name || 'Categorías';
    if (qs('#cms-categories-title')) qs('#cms-categories-title').textContent = section.title || '';
    if (qs('#cms-categories-subtitle')) qs('#cms-categories-subtitle').textContent = section.subtitle || section.content || '';

    const mount = qs('#home-categories');
    const items = sectionItems(section);
    if (!mount || !items.length) return;

    mount.innerHTML = items.map(item => `
      <article class="category-card short-card">
        ${item.image_url ? `<img src="${item.image_url}" alt="${escapeHtml(item.image_alt || item.title || 'Categoría Allmate')}" loading="lazy">` : ''}
        <div class="content">
          ${item.tag ? `<span class="status disponible">${escapeHtml(item.tag)}</span>` : ''}
          <h3>${escapeHtml(item.title || '')}</h3>
          <p>${escapeHtml(item.content || item.subtitle || '')}</p>
          ${item.button_label ? `<a class="btn" href="${item.button_url || '#'}">${escapeHtml(item.button_label)}</a>` : ''}
        </div>
      </article>`).join('');
  }

  function renderCarrusel(section) {
    if (!section) return;
    if (qs('#cms-carrusel-badge')) qs('#cms-carrusel-badge').textContent = section.name || 'Carrusel visual';
    if (qs('#cms-carrusel-title')) qs('#cms-carrusel-title').textContent = section.title || '';
    if (qs('#cms-carrusel-subtitle')) qs('#cms-carrusel-subtitle').textContent = section.subtitle || section.content || '';

    const mount = qs('#visual-marquee');
    const items = sectionItems(section).filter(item => item.image_url);
    if (!mount || !items.length) return;

    const loopItems = [...items, ...items];
    mount.innerHTML = `<div class="visual-track visual-track-soft">${loopItems.map(item => `
      <article class="visual-card visual-card-wide">
        <img src="${item.image_url}" alt="${escapeHtml(item.image_alt || item.title || 'Allmate Motors')}" loading="lazy">
        <div class="visual-card-copy">
          <span>${escapeHtml(item.tag || '')}</span>
          <strong>${escapeHtml(item.title || '')}</strong>
        </div>
      </article>`).join('')}</div>`;
  }

  function renderAbout(section) {
    if (!section || !qs('#cms-about-title')) return;
    if (qs('#cms-about-badge')) qs('#cms-about-badge').textContent = section.name || 'Quiénes somos';
    if (qs('#cms-about-title')) qs('#cms-about-title').textContent = section.title || '';
    if (qs('#cms-about-subtitle')) qs('#cms-about-subtitle').textContent = section.subtitle || '';
    if (qs('#cms-about-image')) {
      const imageItem = sectionItems(section).find(item => item.image_url);
      if (imageItem?.image_url) qs('#cms-about-image').src = imageItem.image_url;
      if (imageItem?.image_alt) qs('#cms-about-image').alt = imageItem.image_alt;
    }

    const mount = qs('#cms-about-items');
    const items = sectionItems(section);
    if (mount && items.length) {
      mount.innerHTML = items.map((item, index) => `
        <div class="about-point">
          <div class="icon-dot">${String(index + 1).padStart(2, '0')}</div>
          <div>
            <strong>${escapeHtml(item.title || '')}</strong><br>
            ${escapeHtml(item.content || item.subtitle || '')}
          </div>
        </div>`).join('');
    }
  }

  function renderContact(section, settings) {
    if (!section || !qs('#cms-contact-title')) return;
    if (qs('#cms-contact-badge')) qs('#cms-contact-badge').textContent = section.name || 'Contacto y ubicación';
    if (qs('#cms-contact-title')) qs('#cms-contact-title').textContent = section.title || '';
    if (qs('#cms-contact-subtitle')) qs('#cms-contact-subtitle').textContent = section.subtitle || section.content || '';

    const rows = [];
    const phone = settings.site_phone || settings.site_whatsapp_label || '';
    const email = settings.site_email || '';
    const address = settings.site_address || '';
    const insta = settings.site_instagram_label || '@allmatemotors.cl';

    if (phone) rows.push(`<div class="info-row"><div><small>WhatsApp</small><strong>${escapeHtml(phone)}</strong></div><a class="btn btn-dark" href="${settings.site_whatsapp || '#'}" target="_blank" rel="noopener">Escribir ahora</a></div>`);
    if (email) rows.push(`<div class="info-row"><div><small>Correo</small><strong>${escapeHtml(email)}</strong></div><a class="btn btn-dark" href="mailto:${escapeHtml(email)}">Enviar correo</a></div>`);
    if (address) rows.push(`<div class="info-row"><div><small>Dirección</small><strong>${escapeHtml(address)}</strong></div><a class="btn btn-dark" href="${settings.google_maps_link || '#'}" target="_blank" rel="noopener">Ver mapa</a></div>`);
    rows.push(`<div class="social-row"><div class="social-group"><span class="social-icon">◎</span><div><small>Instagram</small><strong>${escapeHtml(insta)}</strong></div></div><a class="btn btn-dark" href="${settings.site_instagram || '#'}" target="_blank" rel="noopener">Seguir</a></div>`);
    if (rows.length && qs('#cms-contact-items')) qs('#cms-contact-items').innerHTML = rows.join('');
    if (settings.google_maps_embed && qs('#cms-contact-map')) qs('#cms-contact-map').src = settings.google_maps_embed;
  }

  async function fetchNewsList() {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error('No se pudo cargar noticias');
    return res.json();
  }

  async function fetchNewsDetail(slug) {
    const res = await fetch(`/api/news/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('No se pudo cargar la noticia');
    return res.json();
  }

  function renderNewsCards(newsItems) {
    const list = qs('#news-list');
    if (!list) return;
    if (!newsItems.length) {
      list.innerHTML = '<div class="empty-state">Aún no hay noticias publicadas.</div>';
      return;
    }
    list.innerHTML = newsItems.map(item => `
      <article class="news-card">
        <a class="news-card-media" href="noticia.html?slug=${encodeURIComponent(item.slug)}">
          <img src="${item.image_url || 'images/hero/hero-1.jpeg'}" alt="${escapeHtml(item.title)}" loading="lazy">
        </a>
        <div class="news-card-body">
          <span class="news-date">${escapeHtml(formatDate(item.published_at))}</span>
          <h3><a href="noticia.html?slug=${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.excerpt || '')}</p>
          <a class="btn btn-dark" href="noticia.html?slug=${encodeURIComponent(item.slug)}">Leer noticia</a>
        </div>
      </article>`).join('');
  }

  function renderNewsDetail(article) {
    const root = qs('#news-detail');
    if (!root) return;
    root.innerHTML = `
      <div class="article-main">
        <span class="badge">News</span>
        <p class="article-date">${escapeHtml(formatDate(article.published_at))}</p>
        <h1 class="article-title">${escapeHtml(article.title)}</h1>
        <p class="article-excerpt">${escapeHtml(article.excerpt || '')}</p>
        <img class="article-cover" src="${article.image_url || 'images/hero/hero-1.jpeg'}" alt="${escapeHtml(article.title)}">
        <div class="article-content rich-content">${article.content || ''}</div>
      </div>
      <aside class="article-aside">
        <div class="article-card">
          <h3>Operación local</h3>
          <p>Noticias pensadas para reforzar marca, catálogo KAYO, cobertura en Coronel, Concepción y la Región del Biobío.</p>
        </div>
        <div class="article-card">
          <h3>Volver al listado</h3>
          <a class="btn btn-full" href="news.html">Ver todas las noticias</a>
        </div>
      </aside>`;

    document.title = `${article.title} | Allmate Motors`;
    ensureMeta('description', article.excerpt || article.title);
    injectJsonLd('cms-news-article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt || '',
      image: article.image_url ? [article.image_url] : [],
      datePublished: article.published_at,
      author: {
        '@type': 'Organization',
        name: article.author || 'Allmate Motors'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Allmate Motors'
      },
      mainEntityOfPage: window.location.href
    });
    injectJsonLd('cms-news-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${window.location.origin}/index.html` },
        { '@type': 'ListItem', position: 2, name: 'News', item: `${window.location.origin}/news.html` },
        { '@type': 'ListItem', position: 3, name: article.title, item: window.location.href }
      ]
    });
  }

  async function initHomeCms() {
    try {
      const res = await fetch('/api/cms/page/index');
      if (!res.ok) return;
      const payload = await res.json();
      const sections = byKey(payload.sections || []);
      const flatSettings = applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      renderHero(sections.hero, flatSettings);
      renderOffersHome(sections.ofertas_home);
      renderCategories(sections.categorias);
      renderCarrusel(sections.carrusel_visual);
      renderAbout(sections.quienes_somos);
      renderContact(sections.contacto_ubicacion, flatSettings);
    } catch (error) {
      console.warn('CMS index fallback activo:', error.message);
    }
  }

  async function initProductosCms() {
    try {
      const res = await fetch('/api/cms/page/productos');
      if (!res.ok) return;
      const payload = await res.json();
      const sections = byKey(payload.sections || []);
      applySettings(payload.settings || {});
      applyPageSeo(payload.page);

      const intro = sections.intro;
      if (intro) {
        const badge = qs('#cms-products-badge');
        const title = qs('#cms-products-title');
        const lead = qs('#cms-products-lead');
        if (badge) badge.textContent = intro.subtitle || intro.name || 'Catálogo';
        if (title) title.textContent = intro.title || '';
        if (lead) lead.textContent = intro.content || intro.subtitle || '';
      }

      const repuestos = sections.repuestos;
      if (repuestos) {
        const badge = qs('#cms-repuestos-badge');
        const title = qs('#cms-repuestos-title');
        const lead = qs('#cms-repuestos-lead');
        const content = qs('#cms-repuestos-content');
        if (badge) badge.textContent = repuestos.name || 'Repuestos y cotización';
        if (title) title.textContent = repuestos.title || '';
        if (lead) lead.textContent = repuestos.subtitle || '';
        if (content) content.innerHTML = repuestos.content || '';
      }
    } catch (error) {
      console.warn('CMS productos fallback activo:', error.message);
    }
  }

  async function initOfertasCms() {
    try {
      const res = await fetch('/api/cms/page/ofertas');
      if (!res.ok) return;
      const payload = await res.json();
      const sections = byKey(payload.sections || []);
      applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      const hero = sections.hero || sections.intro || sections.ofertas;
      if (hero) {
        if (qs('#cms-offers-page-badge')) qs('#cms-offers-page-badge').textContent = hero.name || 'Ofertas';
        if (qs('#cms-offers-page-title')) qs('#cms-offers-page-title').textContent = hero.title || '';
        if (qs('#cms-offers-page-lead')) qs('#cms-offers-page-lead').textContent = hero.subtitle || hero.content || '';
      }
    } catch (error) {
      console.warn('CMS ofertas fallback activo:', error.message);
    }
  }

  async function initNewsCms() {
    try {
      const cmsRes = await fetch('/api/cms/page/news');
      if (cmsRes.ok) {
        const payload = await cmsRes.json();
        const sections = byKey(payload.sections || []);
        applySettings(payload.settings || {});
        applyPageSeo(payload.page);
        const intro = sections.intro || sections.listado || sections.news_intro;
        if (intro) {
          const badge = qs('#cms-news-badge');
          const title = qs('#cms-news-title');
          const lead = qs('#cms-news-lead');
          if (badge) badge.textContent = intro.subtitle || intro.name || 'News';
          if (title) title.textContent = intro.title || '';
          if (lead) lead.textContent = intro.content || intro.subtitle || '';
        }
      }
      const items = await fetchNewsList();
      renderNewsCards(items);
    } catch (error) {
      console.warn('CMS news fallback activo:', error.message);
    }
  }

  async function initContactoCms() {
    try {
      const res = await fetch('/api/cms/page/contacto');
      if (!res.ok) return;
      const payload = await res.json();
      const sections = byKey(payload.sections || []);
      const flatSettings = applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      const section = sections.contacto || sections.intro || sections.form;
      if (!section) return;

      if (qs('#cms-contact-page-form-badge')) qs('#cms-contact-page-form-badge').textContent = section.name || 'Formulario de contacto';
      if (qs('#cms-contact-page-form-title')) qs('#cms-contact-page-form-title').textContent = section.title || '';
      if (qs('#cms-contact-page-form-lead')) qs('#cms-contact-page-form-lead').textContent = section.subtitle || section.content || '';
      if (qs('#cms-contact-page-badge')) qs('#cms-contact-page-badge').textContent = section.name || 'Contacto y ubicación';
      if (qs('#cms-contact-page-title')) qs('#cms-contact-page-title').textContent = section.title || '';
      if (qs('#cms-contact-page-lead')) qs('#cms-contact-page-lead').textContent = section.subtitle || section.content || '';

      if (flatSettings.google_maps_embed && qs('#cms-contact-page-map')) qs('#cms-contact-page-map').src = flatSettings.google_maps_embed;
      if (flatSettings.site_address && qs('#cms-contact-page-address')) qs('#cms-contact-page-address').textContent = flatSettings.site_address;
      if (flatSettings.site_email) qsa('[data-contact-email]').forEach(el => el.textContent = flatSettings.site_email);
      if (flatSettings.site_phone) qsa('[data-whatsapp-label]').forEach(el => el.textContent = flatSettings.site_phone);
    } catch (error) {
      console.warn('CMS contacto fallback activo:', error.message);
    }
  }

  async function initArticleCms() {
    try {
      const settingsRes = await fetch('/api/cms/settings/public');
      if (settingsRes.ok) applySettings(await settingsRes.json());
      const slug = new URLSearchParams(window.location.search).get('slug');
      if (!slug) return;
      const article = await fetchNewsDetail(slug);
      renderNewsDetail(article);
    } catch (error) {
      const root = qs('#news-detail');
      if (root) root.innerHTML = '<div class="empty-state">No se pudo cargar la noticia.</div>';
      console.warn('CMS noticia fallback activo:', error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (PAGE === 'home') initHomeCms();
    if (PAGE === 'productos') initProductosCms();
    if (PAGE === 'ofertas') initOfertasCms();
    if (PAGE === 'news') initNewsCms();
    if (PAGE === 'contacto') initContactoCms();
    if (PAGE === 'noticia') initArticleCms();
  });
})();

(function () {
  const PAGE = document.body?.dataset?.page;
  if (!PAGE) return;

  const CMS_FETCH_OPTIONS = {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache'
    }
  };

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
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
  function injectJsonLd(id, data) {
    if (!data) return;
    const prev = document.getElementById(id);
    if (prev) prev.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
  function byKey(sections) {
    return Object.fromEntries((sections || []).map(s => [s.section_key, s]));
  }
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  }
  function activeItems(section) {
    return (section?.items || []).filter(item => item.is_active).sort((a, b) => a.sort_order - b.sort_order);
  }
  async function fetchJson(url) {
    const res = await fetch(url, CMS_FETCH_OPTIONS);
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    return res.json();
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
    return flat;
  }

  function renderHero(section, settings) {
    if (!section || !qs('#cms-hero-title')) return;
    const badge = qs('#cms-hero-badge');
    const title = qs('#cms-hero-title');
    const subtitle = qs('#cms-hero-subtitle');
    if (badge) badge.textContent = section.name || badge.textContent;
    if (title) title.textContent = section.title || title.textContent;
    if (subtitle) subtitle.textContent = section.subtitle || section.content || subtitle.textContent;

    const strip = qs('#cms-hero-strip');
    const items = activeItems(section);
    if (items.length && strip) {
      strip.innerHTML = items
        .map((item, index) => `
          <div class="strip-item">
            <div class="strip-icon">${escapeHtml(item.tag || String(index + 1).padStart(2, '0'))}</div>
            <div>
              <strong>${escapeHtml(item.title || '')}</strong>
              <span>${escapeHtml(item.content || item.subtitle || '')}</span>
            </div>
          </div>`).join('');
    }

    const activeSlide = items.find(item => item.image_url);
    if (activeSlide && qs('#cms-hero-background')) {
      qs('#cms-hero-background').style.backgroundImage = `url('${activeSlide.image_url}')`;
      qs('#cms-hero-background').style.backgroundSize = 'cover';
      qs('#cms-hero-background').style.backgroundPosition = 'center';
      if (activeSlide.button_label && qs('#cms-hero-cta-primary')) qs('#cms-hero-cta-primary').textContent = activeSlide.button_label;
      if (activeSlide.button_url && qs('#cms-hero-cta-primary')) qs('#cms-hero-cta-primary').setAttribute('href', activeSlide.button_url);
    }

    injectJsonLd('cms-home-localbusiness', {
      '@context': 'https://schema.org',
      '@type': 'MotorcycleDealer',
      name: settings.business_name || 'Allmate Motors',
      url: `${window.location.origin}/`,
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
    const badge = qs('#cms-offers-badge');
    const title = qs('#cms-offers-title');
    const subtitle = qs('#cms-offers-subtitle');
    if (badge) badge.textContent = section.name || badge.textContent;
    if (title) title.textContent = section.title || title.textContent;
    if (subtitle) subtitle.textContent = section.subtitle || section.content || subtitle.textContent;

    const mount = qs('#offer-highlight');
    const items = activeItems(section);
    if (!mount || !items.length) return; // no romper fallback estático

    mount.innerHTML = `
      <div class="offer-highlight-shell">
        <div class="offer-highlight-track">
          ${[...items, ...items, ...items].map(item => `
            <article class="offer-feature-card">
              <div class="offer-feature-media ${item.image_url ? '' : 'empty'}">
                ${item.image_url ? `<img src="${item.image_url}" alt="${escapeHtml(item.image_alt || item.title || 'Oferta KAYO')}" loading="lazy">` : '<span>Imagen pendiente</span>'}
              </div>
              <div class="offer-feature-copy">
                <span class="offer-label">${escapeHtml(item.tag || section.name || 'Oferta')}</span>
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.content || item.subtitle || '')}</p>
                ${item.button_label ? `<a class="btn" href="${item.button_url || '#'}">${escapeHtml(item.button_label)}</a>` : ''}
              </div>
            </article>`).join('')}
        </div>
      </div>`;
  }

  function renderCategories(section) {
    if (!section || !qs('#home-categories')) return;
    const badge = qs('#cms-categories-badge');
    const title = qs('#cms-categories-title');
    const subtitle = qs('#cms-categories-subtitle');
    if (badge) badge.textContent = section.name || badge.textContent;
    if (title) title.textContent = section.title || title.textContent;
    if (subtitle) subtitle.textContent = section.subtitle || section.content || subtitle.textContent;

    const items = activeItems(section);
    if (!items.length) return; // no romper fallback estático

    qs('#home-categories').innerHTML = items.map(item => `
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
    if (!section || !qs('#visual-marquee')) return;
    const badge = qs('#cms-carrusel-badge');
    const title = qs('#cms-carrusel-title');
    const subtitle = qs('#cms-carrusel-subtitle');
    if (badge) badge.textContent = section.name || badge.textContent;
    if (title) title.textContent = section.title || title.textContent;
    if (subtitle) subtitle.textContent = section.subtitle || section.content || subtitle.textContent;

    const items = activeItems(section).filter(item => item.image_url);
    if (!items.length) return; // no romper fallback estático

    qs('#visual-marquee').innerHTML = `
      <div class="visual-track visual-track-soft">
        ${[...items, ...items].map(item => `
          <article class="visual-card visual-card-wide">
            <img src="${item.image_url}" alt="${escapeHtml(item.image_alt || item.title || 'Allmate Motors')}" loading="lazy">
            <div class="visual-card-copy"><span>${escapeHtml(item.tag || '')}</span><strong>${escapeHtml(item.title || '')}</strong></div>
          </article>`).join('')}
      </div>`;
  }

  function renderAbout(section) {
    if (!section || !qs('#cms-about-title')) return;
    const badge = qs('#cms-about-badge');
    const title = qs('#cms-about-title');
    const subtitle = qs('#cms-about-subtitle');
    const image = qs('#cms-about-image');
    if (badge) badge.textContent = section.name || badge.textContent;
    if (title) title.textContent = section.title || title.textContent;
    if (subtitle && (section.subtitle || section.content)) subtitle.textContent = section.subtitle || section.content || subtitle.textContent;

    const items = activeItems(section);
    if (items.length && qs('#cms-about-items')) {
      qs('#cms-about-items').innerHTML = items.map((item, index) => `
        <div class="about-point">
          <div class="icon-dot">${escapeHtml(item.tag || String(index + 1).padStart(2, '0'))}</div>
          <div><strong>${escapeHtml(item.title || '')}</strong><br>${escapeHtml(item.content || item.subtitle || '')}</div>
        </div>`).join('');
    }
    const imageItem = items.find(item => item.image_url);
    if (image && imageItem?.image_url) image.src = imageItem.image_url;
  }

  function renderContactBlock(badgeSel, titleSel, subtitleSel, section, settings, itemsSel, mapSel, mapLinkSel) {
    const badge = qs(badgeSel);
    const title = qs(titleSel);
    const subtitle = qs(subtitleSel);
    if (section) {
      if (badge) badge.textContent = section.name || badge.textContent;
      if (title) title.textContent = section.title || title.textContent;
      if (subtitle) subtitle.textContent = section.subtitle || section.content || subtitle.textContent;
    }

    const phone = settings.site_phone || settings.site_whatsapp_label || '';
    const email = settings.site_email || '';
    const address = settings.site_address || '';
    const insta = settings.site_instagram_label || '@allmatemotors.cl';
    const itemsMount = qs(itemsSel);
    if (itemsMount && (phone || email || address || insta)) {
      itemsMount.innerHTML = `
        <div class="info-row">
          <div><small>WhatsApp</small><strong>${escapeHtml(phone)}</strong></div>
          <a class="btn btn-dark" href="${settings.site_whatsapp || '#'}" target="_blank" rel="noopener">Escribir ahora</a>
        </div>
        <div class="info-row">
          <div><small>Correo</small><strong>${escapeHtml(email)}</strong></div>
          <a class="btn btn-dark" href="mailto:${escapeHtml(email)}">Enviar correo</a>
        </div>
        <div class="info-row">
          <div><small>Dirección</small><strong>${escapeHtml(address)}</strong></div>
          <a class="btn btn-dark" href="${settings.google_maps_link || '#'}" target="_blank" rel="noopener">Ver mapa</a>
        </div>
        <div class="social-row">
          <div class="social-group"><span class="social-icon">🟢</span><div><small>WhatsApp</small><strong>${escapeHtml(phone)}</strong></div></div>
          <a class="btn btn-dark" href="${settings.site_whatsapp || '#'}" target="_blank" rel="noopener">Abrir</a>
        </div>
        <div class="social-row">
          <div class="social-group"><span class="social-icon">◎</span><div><small>Instagram</small><strong>${escapeHtml(insta)}</strong></div></div>
          <a class="btn btn-dark" href="${settings.site_instagram || '#'}" target="_blank" rel="noopener">Seguir</a>
        </div>`;
    }
    const map = qs(mapSel);
    if (map && settings.google_maps_embed) map.src = settings.google_maps_embed;
    const mapLink = qs(mapLinkSel);
    if (mapLink && settings.google_maps_link) mapLink.href = settings.google_maps_link;
  }

  function renderContact(section, settings) {
    renderContactBlock('#cms-contact-badge', '#cms-contact-title', '#cms-contact-subtitle', section, settings, '#cms-contact-items', '#cms-contact-map');
  }

  async function fetchNewsList() {
    return fetchJson('/api/news');
  }

  function renderNewsCards(items) {
    const mount = qs('#news-list');
    if (!mount) return;
    mount.innerHTML = items.map(item => `
      <article class="news-card">
        <a href="noticia.html?slug=${encodeURIComponent(item.slug)}" class="news-card-link">
          ${item.image_url ? `<img class="news-image" src="${item.image_url}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}
          <div class="card-body">
            <small>${formatDate(item.published_at)}</small>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt || '')}</p>
            <span class="text-link">Leer noticia completa</span>
          </div>
        </a>
      </article>`).join('');
  }

  async function fetchNewsDetail(slug) {
    return fetchJson(`/api/news/${encodeURIComponent(slug)}`);
  }

  function renderNewsDetail(article) {
    const root = qs('#news-detail');
    if (!root || !article) return;
    root.innerHTML = `
      <div class="article-hero">${article.image_url ? `<img src="${article.image_url}" alt="${escapeHtml(article.title)}" loading="eager">` : ''}</div>
      <article class="article-main article-box">
        <div class="article-meta">${formatDate(article.published_at)}</div>
        <h1 class="article-title">${escapeHtml(article.title)}</h1>
        <div class="article-body">${article.content || ''}</div>
      </article>`;

    document.title = `${article.title} | Allmate Motors`;
    ensureMeta('description', article.excerpt || '');
    injectJsonLd('cms-article-jsonld', {
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
      const payload = await fetchJson('/api/cms/page/index');
      const sections = byKey(payload.sections || []);
      const flatSettings = applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      renderHero(sections.hero, flatSettings);
      renderOffersHome(sections.ofertas_home || sections.ofertas_destacadas || sections.ofertas);
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
      const payload = await fetchJson('/api/cms/page/productos');
      const sections = byKey(payload.sections || []);
      applySettings(payload.settings || {});
      applyPageSeo(payload.page);

      const intro = sections.intro;
      if (intro) {
        const badge = qs('#cms-products-badge');
        const title = qs('#cms-products-title');
        const lead = qs('#cms-products-lead');
        if (badge) badge.textContent = intro.subtitle || intro.name || badge.textContent;
        if (title) title.textContent = intro.title || title.textContent;
        if (lead) lead.textContent = intro.content || intro.subtitle || lead.textContent;
      }

      const repuestos = sections.repuestos;
      if (repuestos) {
        const badge = qs('#cms-repuestos-badge');
        const title = qs('#cms-repuestos-title');
        const lead = qs('#cms-repuestos-lead');
        const content = qs('#cms-repuestos-content');
        if (badge) badge.textContent = repuestos.name || badge.textContent;
        if (title) title.textContent = repuestos.title || title.textContent;
        if (lead) lead.textContent = repuestos.subtitle || lead.textContent;
        if (content && repuestos.content) content.innerHTML = repuestos.content;
      }
    } catch (error) {
      console.warn('CMS productos fallback activo:', error.message);
    }
  }

  async function initOfertasCms() {
    try {
      const payload = await fetchJson('/api/cms/page/ofertas');
      const sections = byKey(payload.sections || []);
      applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      const intro = sections.hero || sections.intro || sections.ofertas;
      if (intro) {
        const badge = qs('#cms-offers-page-badge');
        const title = qs('#cms-offers-page-title');
        const lead = qs('#cms-offers-page-lead');
        if (badge) badge.textContent = intro.name || badge.textContent;
        if (title) title.textContent = intro.title || title.textContent;
        if (lead) lead.textContent = intro.subtitle || intro.content || lead.textContent;
      }
    } catch (error) {
      console.warn('CMS ofertas fallback activo:', error.message);
    }
  }

  async function initNewsCms() {
    try {
      const payload = await fetchJson('/api/cms/page/news');
      const sections = byKey(payload.sections || []);
      applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      const intro = sections.intro || sections.listado || sections.news_intro || sections.hero;
      if (intro) {
        const badge = qs('#cms-news-badge');
        const title = qs('#cms-news-title');
        const lead = qs('#cms-news-lead');
        if (badge) badge.textContent = intro.subtitle || intro.name || badge.textContent;
        if (title) title.textContent = intro.title || title.textContent;
        if (lead) lead.textContent = intro.content || intro.subtitle || lead.textContent;
      }
      const items = await fetchNewsList();
      renderNewsCards(items);
    } catch (error) {
      console.warn('CMS news fallback activo:', error.message);
    }
  }

  async function initContactoCms() {
    try {
      const payload = await fetchJson('/api/cms/page/contacto');
      const sections = byKey(payload.sections || []);
      const flatSettings = applySettings(payload.settings || {});
      applyPageSeo(payload.page);
      const contact = sections.contacto || sections.form || sections.hero || sections.intro;
      renderContactBlock('#cms-contact-page-badge', '#cms-contact-page-title', '#cms-contact-page-lead', contact, flatSettings, '#cms-contact-page-items', '#cms-contact-page-map', '#cms-contact-page-map-link');
    } catch (error) {
      console.warn('CMS contacto fallback activo:', error.message);
    }
  }

  async function initArticleCms() {
    try {
      const settings = await fetchJson('/api/cms/settings/public');
      applySettings(settings);
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

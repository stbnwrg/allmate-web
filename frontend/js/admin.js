const API = '/api';
const MEDIA_SECTIONS = ['hero', 'carrusel_visual'];
const state = {
  pages: [],
  currentPageSlug: null,
  currentPage: null,
  sections: [],
  settings: [],
  products: [],
  news: [],
};

function getToken() {
  return localStorage.getItem('allmate_admin_token');
}

function setAlert(message, type = 'success') {
  const box = document.getElementById('admin-alert');
  box.className = `alert show ${type}`;
  box.textContent = message;
  clearTimeout(setAlert._timer);
  setAlert._timer = setTimeout(() => box.classList.remove('show'), 3500);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!headers.Authorization && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data.message || 'Error inesperado');
  return data;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return 'Sin precio';
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 'Sin precio';
  return `$${parsed.toLocaleString('es-CL')}`;
}

function toInputDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isMediaSection(section) {
  return MEDIA_SECTIONS.includes(section.section_key);
}

function getEntityMode() {
  if (!state.currentPageSlug) return null;
  if (state.currentPageSlug === 'productos') return 'products';
  if (state.currentPageSlug === 'ofertas') return 'offers';
  if (state.currentPageSlug === 'news') return 'news';
  return null;
}

function renderPageNav() {
  const nav = document.getElementById('cms-page-nav');
  nav.innerHTML = state.pages.map((page) => `
    <button class="cms-page-btn ${page.slug === state.currentPageSlug ? 'active' : ''}" data-page-slug="${page.slug}">
      <strong>${escapeHtml(page.name)}</strong>
      <small>${escapeHtml(page.slug)}</small>
    </button>
  `).join('');

  nav.querySelectorAll('[data-page-slug]').forEach((btn) => {
    btn.addEventListener('click', () => loadPageDetail(btn.dataset.pageSlug));
  });
}

function renderMeta() {
  const wrap = document.getElementById('cms-page-meta');
  if (!state.currentPage) {
    wrap.innerHTML = '';
    return;
  }
  wrap.innerHTML = `
    <div><strong>Slug</strong>${escapeHtml(state.currentPage.slug)}</div>
    <div><strong>Secciones</strong>${state.sections.length}</div>
    <div><strong>Activa</strong>${state.currentPage.is_active ? 'Sí' : 'No'}</div>
    <div><strong>SEO modelado</strong>${state.currentPage.seo_title ? 'Sí' : 'Pendiente'}</div>
  `;
}

function getSectionHelperText(section) {
  if (state.currentPageSlug === 'productos') {
    return '<span class="cms-inline-hint">Aquí editas el copy y la estructura de la página. El catálogo real se administra más abajo en el gestor de productos.</span>';
  }
  if (state.currentPageSlug === 'ofertas') {
    return '<span class="cms-inline-hint">Aquí editas el encabezado y copy de la página. Las ofertas reales se administran más abajo desde productos con precio anterior.</span>';
  }
  if (state.currentPageSlug === 'news') {
    return '<span class="cms-inline-hint">Aquí editas el marco editorial de la página. Las noticias reales se administran más abajo en el gestor de noticias.</span>';
  }
  return isMediaSection(section)
    ? '<span class="cms-inline-hint">Sección multimedia: agrega, cambia, reordena y activa/desactiva slides e imágenes sin tocar código.</span>'
    : '<span class="cms-inline-hint">Sección de contenido: puedes editar copy, CTAs, imagen y estado de cada bloque.</span>';
}

function renderSectionCard(section) {
  const tpl = document.getElementById('tpl-section-card');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.querySelector('.js-layout').textContent = section.layout_type || 'default';
  node.querySelector('.js-name').textContent = section.name || 'Sección';
  node.querySelector('.js-section-key').textContent = section.section_key || '';
  node.querySelector('.js-title').textContent = section.title || 'Sin título';
  node.querySelector('.js-subtitle').textContent = section.subtitle || 'Sin subtítulo';
  node.querySelector('.js-content').innerHTML = section.content || '<p>Sin contenido.</p>';
  node.querySelector('.js-edit-section').addEventListener('click', () => openSectionModal(section));
  node.querySelector('.js-new-item').addEventListener('click', () => openItemModal(section, null));

  const helper = node.querySelector('.js-section-helper');
  if (helper) helper.innerHTML = getSectionHelperText(section);

  const itemsWrap = node.querySelector('.js-items');
  if (!section.items?.length) {
    itemsWrap.innerHTML = '<div class="empty-state">Esta sección aún no tiene ítems.</div>';
  } else {
    section.items.forEach((item, index) => itemsWrap.appendChild(renderItemCard(section, item, index, section.items.length)));
  }
  return node;
}

function renderItemCard(section, item, index, total) {
  const tpl = document.getElementById('tpl-item-card');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.querySelector('.js-tag').textContent = item.tag || item.badge || item.item_key || 'item';
  node.querySelector('.js-title').textContent = item.title || 'Sin título';
  node.querySelector('.js-key').textContent = item.item_key || '';
  node.querySelector('.js-state').textContent = item.is_active ? 'Activo' : 'Oculto';
  node.querySelector('.js-state').classList.toggle('is-inactive', !item.is_active);
  node.querySelector('.js-copy').innerHTML = `
    ${item.subtitle ? `<p><strong>Subtítulo:</strong> ${escapeHtml(item.subtitle)}</p>` : ''}
    ${item.content ? `<div>${item.content}</div>` : ''}
    ${item.button_label ? `<p><strong>Botón:</strong> ${escapeHtml(item.button_label)} → ${escapeHtml(item.button_url || '#')}</p>` : ''}
    ${item.price ? `<p><strong>Precio:</strong> ${formatMoney(item.price)}</p>` : ''}
    ${item.old_price ? `<p><strong>Precio anterior:</strong> ${formatMoney(item.old_price)}</p>` : ''}
  `;
  const imageWrap = node.querySelector('.js-image-wrap');
  imageWrap.innerHTML = item.image_url
    ? `<img src="${item.image_url}" alt="${escapeHtml(item.image_alt || item.title || 'imagen')}">`
    : '<div class="empty-state">Sin imagen</div>';

  const quick = node.querySelector('.js-quick-actions');
  quick.innerHTML = `
    <button class="btn btn-xs btn-dark js-move-up" type="button" ${index === 0 ? 'disabled' : ''}>↑</button>
    <button class="btn btn-xs btn-dark js-move-down" type="button" ${index === total - 1 ? 'disabled' : ''}>↓</button>
    <button class="btn btn-xs ${item.is_active ? 'btn-outline' : ''} js-toggle-item" type="button">${item.is_active ? 'Ocultar' : 'Activar'}</button>
    <button class="btn btn-xs btn-dark js-change-image" type="button">Imagen</button>
  `;

  node.querySelector('.js-edit-item').addEventListener('click', () => openItemModal(section, item));
  node.querySelector('.js-delete-item').addEventListener('click', async () => {
    if (!confirm('¿Eliminar este ítem?')) return;
    try {
      await api(`/admin/cms/items/${item.id}`, { method: 'DELETE' });
      setAlert('Ítem eliminado.');
      await loadPageDetail(state.currentPageSlug);
    } catch (error) {
      setAlert(error.message, 'error');
    }
  });

  node.querySelector('.js-move-up')?.addEventListener('click', () => moveItem(item.id, 'up'));
  node.querySelector('.js-move-down')?.addEventListener('click', () => moveItem(item.id, 'down'));
  node.querySelector('.js-toggle-item')?.addEventListener('click', () => toggleItem(item.id));
  node.querySelector('.js-change-image')?.addEventListener('click', () => openImageModal(section, item));
  return node;
}

function renderProductRow(product, mode = 'products') {
  const offerActive = product.old_price && Number(product.old_price) > Number(product.price || 0);
  const chips = [
    `<span class="cms-chip">${escapeHtml(product.category || 'Sin categoría')}</span>`,
    `<span class="cms-chip ${product.is_active ? '' : 'cms-chip-muted'}">${product.is_active ? 'Activo' : 'Oculto'}</span>`,
    product.featured ? '<span class="cms-chip">Destacado</span>' : '',
    offerActive ? '<span class="cms-chip">Oferta</span>' : '',
  ].filter(Boolean).join('');

  return `
    <article class="cms-entity-item">
      <div class="cms-entity-main">
        <div class="cms-entity-head">
          <h4>${escapeHtml(product.name)}</h4>
          <small>${escapeHtml(product.slug)}</small>
        </div>
        <div class="cms-entity-meta">${chips}</div>
        <p class="cms-entity-copy">${escapeHtml(product.short_description || product.description || 'Sin descripción corta.')}</p>
        <div class="cms-entity-prices">
          <strong>${formatMoney(product.price)}</strong>
          ${product.old_price ? `<span>${formatMoney(product.old_price)}</span>` : ''}
        </div>
      </div>
      <div class="cms-entity-actions">
        <button class="btn btn-dark js-edit-product" data-product-id="${product.id}" type="button">Editar</button>
        ${mode === 'offers' && offerActive ? `<button class="btn btn-outline js-remove-offer" data-product-id="${product.id}" type="button">Quitar oferta</button>` : ''}
        <button class="btn btn-outline js-toggle-product" data-product-id="${product.id}" type="button">${product.is_active ? 'Ocultar' : 'Activar'}</button>
      </div>
    </article>
  `;
}

function renderNewsRow(article) {
  return `
    <article class="cms-entity-item">
      <div class="cms-entity-main">
        <div class="cms-entity-head">
          <h4>${escapeHtml(article.title)}</h4>
          <small>${escapeHtml(article.slug)}</small>
        </div>
        <div class="cms-entity-meta">
          <span class="cms-chip ${article.is_active ? '' : 'cms-chip-muted'}">${article.is_active ? 'Publicado' : 'Oculto'}</span>
          <span class="cms-chip">${escapeHtml(article.author || 'Allmate Motors')}</span>
          <span class="cms-chip">${new Date(article.published_at).toLocaleDateString('es-CL')}</span>
        </div>
        <p class="cms-entity-copy">${escapeHtml(article.excerpt || 'Sin extracto.')}</p>
      </div>
      <div class="cms-entity-actions">
        <button class="btn btn-dark js-edit-news" data-news-id="${article.id}" type="button">Editar</button>
        <button class="btn btn-outline js-toggle-news" data-news-id="${article.id}" type="button">${article.is_active ? 'Ocultar' : 'Activar'}</button>
      </div>
    </article>
  `;
}

function renderEntityManager() {
  const mode = getEntityMode();
  if (!mode) return null;

  const card = document.createElement('article');
  card.className = 'cms-section-card cms-entity-card';

  if (mode === 'products' || mode === 'offers') {
    const source = mode === 'offers'
      ? state.products.filter((item) => item.old_price && Number(item.old_price) > Number(item.price || 0))
      : state.products;

    card.innerHTML = `
      <div class="cms-section-card-head">
        <div>
          <span class="badge badge-dark">${mode === 'offers' ? 'Ofertas reales' : 'Catálogo real'}</span>
          <h3>${mode === 'offers' ? 'Gestor de ofertas' : 'Gestor de productos'}</h3>
          <p class="cms-section-key">${mode === 'offers' ? 'Las ofertas salen de productos con precio y precio anterior.' : 'CRUD real sobre la tabla products, sin depender de cms_items.'}</p>
        </div>
        <div class="cms-card-actions">
          <button class="btn js-new-product" type="button">${mode === 'offers' ? 'Nueva oferta' : 'Nuevo producto'}</button>
        </div>
      </div>
      <div class="cms-entity-list ${source.length ? '' : 'is-empty'}">
        ${source.length ? source.map((item) => renderProductRow(item, mode)).join('') : `<div class="empty-state">${mode === 'offers' ? 'Aún no hay productos con oferta activa. Edita un producto y define price + old_price.' : 'No hay productos cargados todavía.'}</div>`}
      </div>
    `;

    card.querySelector('.js-new-product')?.addEventListener('click', () => openProductModal(mode === 'offers'));
    card.querySelectorAll('.js-edit-product').forEach((btn) => {
      btn.addEventListener('click', () => {
        const product = state.products.find((item) => String(item.id) === btn.dataset.productId);
        openProductModal(mode === 'offers', product);
      });
    });
    card.querySelectorAll('.js-toggle-product').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const product = state.products.find((item) => String(item.id) === btn.dataset.productId);
        if (!product) return;
        try {
          await saveProduct({ ...product, is_active: !product.is_active }, null, true);
          await loadPageDetail(state.currentPageSlug);
          setAlert(`Producto ${product.is_active ? 'ocultado' : 'activado'} correctamente.`);
        } catch (error) {
          setAlert(error.message, 'error');
        }
      });
    });
    card.querySelectorAll('.js-remove-offer').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const product = state.products.find((item) => String(item.id) === btn.dataset.productId);
        if (!product) return;
        try {
          await saveProduct({ ...product, old_price: null }, null, true);
          await loadPageDetail(state.currentPageSlug);
          setAlert('Oferta eliminada del producto.');
        } catch (error) {
          setAlert(error.message, 'error');
        }
      });
    });
    return card;
  }

  if (mode === 'news') {
    card.innerHTML = `
      <div class="cms-section-card-head">
        <div>
          <span class="badge badge-dark">Noticias reales</span>
          <h3>Gestor de noticias</h3>
          <p class="cms-section-key">CRUD real sobre la tabla news. Desde aquí se controlan las tarjetas y páginas individuales.</p>
        </div>
        <div class="cms-card-actions">
          <button class="btn js-new-news" type="button">Nueva noticia</button>
        </div>
      </div>
      <div class="cms-entity-list ${state.news.length ? '' : 'is-empty'}">
        ${state.news.length ? state.news.map(renderNewsRow).join('') : '<div class="empty-state">No hay noticias cargadas todavía.</div>'}
      </div>
    `;

    card.querySelector('.js-new-news')?.addEventListener('click', () => openNewsModal());
    card.querySelectorAll('.js-edit-news').forEach((btn) => {
      btn.addEventListener('click', () => {
        const article = state.news.find((item) => String(item.id) === btn.dataset.newsId);
        openNewsModal(article);
      });
    });
    card.querySelectorAll('.js-toggle-news').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const article = state.news.find((item) => String(item.id) === btn.dataset.newsId);
        if (!article) return;
        try {
          await saveNews({ ...article, is_active: !article.is_active }, true);
          await loadPageDetail(state.currentPageSlug);
          setAlert(`Noticia ${article.is_active ? 'ocultada' : 'activada'} correctamente.`);
        } catch (error) {
          setAlert(error.message, 'error');
        }
      });
    });
    return card;
  }

  return null;
}

function renderSections() {
  const wrap = document.getElementById('cms-sections-wrap');
  document.getElementById('cms-page-title').textContent = state.currentPage?.name || 'Selecciona una página';
  renderMeta();
  wrap.innerHTML = '';
  if (!state.sections.length) {
    wrap.innerHTML = '<div class="empty-state">Esta página todavía no tiene secciones.</div>';
  } else {
    state.sections.forEach((section) => wrap.appendChild(renderSectionCard(section)));
  }
  const entityManager = renderEntityManager();
  if (entityManager) wrap.appendChild(entityManager);
}

async function loginAdmin(event) {
  event.preventDefault();
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('admin_email').value,
        password: document.getElementById('admin_password').value,
      }),
    });
    localStorage.setItem('allmate_admin_token', data.token);
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'inline-flex';
    await bootDashboard();
  } catch (error) {
    setAlert(error.message, 'error');
  }
}

async function bootDashboard() {
  try {
    state.pages = await api('/admin/cms/pages');
    renderPageNav();
    if (state.pages.length) await loadPageDetail(state.pages[0].slug);
  } catch (error) {
    setAlert(error.message, 'error');
  }
}

async function loadEntityDataForPage(slug) {
  if (slug === 'productos' || slug === 'ofertas') {
    state.products = await api('/productos/admin');
    state.news = [];
    return;
  }
  if (slug === 'news') {
    state.news = await api('/news/admin');
    state.products = [];
    return;
  }
  state.products = [];
  state.news = [];
}

async function loadPageDetail(slug) {
  try {
    const payload = await api(`/admin/cms/pages/${slug}`);
    state.currentPageSlug = slug;
    state.currentPage = payload.page;
    state.sections = payload.sections;
    state.settings = payload.settings;
    await loadEntityDataForPage(slug);
    renderPageNav();
    renderSections();
  } catch (error) {
    setAlert(error.message, 'error');
  }
}

function openModal(title, bodyHtml, onReady) {
  const modal = document.getElementById('cms-modal');
  document.getElementById('cms-modal-title').textContent = title;
  const body = document.getElementById('cms-modal-body');
  body.innerHTML = bodyHtml;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  if (onReady) onReady(body);
}

function closeModal() {
  const modal = document.getElementById('cms-modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function richEditor(label, id, value = '') {
  return `
    <div class="full">
      <label>${label}</label>
      <div class="cms-toolbar">
        <button type="button" data-cmd="bold"><b>B</b></button>
        <button type="button" data-cmd="italic"><i>I</i></button>
        <button type="button" data-cmd="insertUnorderedList">•</button>
        <button type="button" data-cmd="insertOrderedList">1.</button>
        <button type="button" data-cmd="createLink">🔗</button>
      </div>
      <div id="${id}" class="cms-richtext" contenteditable="true">${value || ''}</div>
    </div>
  `;
}

function bindToolbar(root) {
  root.querySelectorAll('[data-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      if (cmd === 'createLink') {
        const url = prompt('URL del enlace');
        if (url) document.execCommand(cmd, false, url);
        return;
      }
      document.execCommand(cmd, false, null);
    });
  });
}

function openPageModal(page) {
  const isEdit = !!page;
  openModal(isEdit ? 'Editar página' : 'Nueva página', `
    <form id="cms-page-form" class="cms-form-grid">
      <input type="hidden" name="id" value="${page?.id || ''}">
      <div><label>Slug</label><input name="slug" required value="${page?.slug || ''}"></div>
      <div><label>Nombre</label><input name="name" required value="${page?.name || ''}"></div>
      <div class="full"><label>Descripción</label><textarea name="description">${page?.description || ''}</textarea></div>
      <div><label>Orden</label><input name="sort_order" type="number" value="${page?.sort_order || 100}"></div>
      <div><label>Activa</label><select name="is_active"><option value="true" ${page?.is_active !== false ? 'selected' : ''}>Sí</option><option value="false" ${page?.is_active === false ? 'selected' : ''}>No</option></select></div>
      <div class="full"><label>SEO title (modelado)</label><input name="seo_title" value="${page?.seo_title || ''}"></div>
      <div class="full"><label>SEO description (modelado)</label><textarea name="seo_description">${page?.seo_description || ''}</textarea></div>
      <div class="cms-form-actions full">
        <button type="button" class="btn btn-dark" data-close-modal="true">Cancelar</button>
        <button type="submit" class="btn">Guardar página</button>
      </div>
    </form>
  `, (body) => {
    body.querySelector('#cms-page-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.is_active = payload.is_active === 'true';
      payload.sort_order = Number(payload.sort_order || 100);
      try {
        if (page?.id) {
          await api(`/admin/cms/pages/${page.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
          await api('/admin/cms/pages', { method: 'POST', body: JSON.stringify(payload) });
        }
        closeModal();
        state.pages = await api('/admin/cms/pages');
        renderPageNav();
        await loadPageDetail(payload.slug);
        setAlert('Página guardada correctamente.');
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  });
}

function openSectionModal(section) {
  const isEdit = !!section;
  openModal(isEdit ? 'Editar sección' : 'Nueva sección', `
    <form id="cms-section-form" class="cms-form-grid">
      <input type="hidden" name="id" value="${section?.id || ''}">
      <input type="hidden" name="page_id" value="${state.currentPage.id}">
      <div><label>Section key</label><input name="section_key" required value="${section?.section_key || ''}" ${isEdit ? 'readonly' : ''}></div>
      <div><label>Nombre interno</label><input name="name" required value="${section?.name || ''}"></div>
      <div><label>Layout</label><input name="layout_type" value="${section?.layout_type || 'default'}"></div>
      <div><label>Orden</label><input name="sort_order" type="number" value="${section?.sort_order || 100}"></div>
      <div><label>Activa</label><select name="is_active"><option value="true" ${section?.is_active !== false ? 'selected' : ''}>Sí</option><option value="false" ${section?.is_active === false ? 'selected' : ''}>No</option></select></div>
      <div class="full"><label>Título</label><input name="title" value="${section?.title || ''}"></div>
      <div class="full"><label>Subtítulo</label><textarea name="subtitle">${section?.subtitle || ''}</textarea></div>
      ${richEditor('Contenido', 'section-content-editor', section?.content || '')}
      <div class="cms-form-actions full">
        <button type="button" class="btn btn-dark" data-close-modal="true">Cancelar</button>
        <button type="submit" class="btn">Guardar sección</button>
      </div>
    </form>
  `, (body) => {
    bindToolbar(body);
    body.querySelector('#cms-section-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.is_active = payload.is_active === 'true';
      payload.sort_order = Number(payload.sort_order || 100);
      payload.content = body.querySelector('#section-content-editor').innerHTML;
      try {
        if (section?.id) {
          await api(`/admin/cms/sections/${section.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
          await api('/admin/cms/sections', { method: 'POST', body: JSON.stringify(payload) });
        }
        closeModal();
        await loadPageDetail(state.currentPageSlug);
        setAlert('Sección guardada correctamente.');
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  });
}

function getMediaFolder(section) {
  if (section?.section_key === 'hero') return 'hero';
  if (section?.section_key === 'carrusel_visual') return 'carrusel';
  return section?.section_key || 'general';
}

async function uploadCmsImage(file, folder, altText = '') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  formData.append('alt_text', altText);
  return api('/admin/cms/media/upload', { method: 'POST', body: formData });
}

function buildMediaHelper(section) {
  if (!isMediaSection(section)) return '';
  return `
    <div class="full cms-media-helper">
      <strong>Modo multimedia activo</strong>
      <p>En esta sección puedes agregar slides e imágenes, cambiar foto sin editar URL, reordenar visualmente y activar/desactivar bloques.</p>
    </div>
  `;
}

function openItemModal(section, item) {
  const extra = item?.extra_json || {};
  openModal(item ? `Editar ítem: ${item.title || item.item_key}` : `Nuevo ítem en ${section.name}`, `
    <form id="cms-item-form" class="cms-form-grid">
      <input type="hidden" name="id" value="${item?.id || ''}">
      <input type="hidden" name="section_id" value="${section.id}">
      <div><label>Item key</label><input name="item_key" value="${item?.item_key || ''}"></div>
      <div><label>Etiqueta / Tag</label><input name="tag" value="${item?.tag || ''}"></div>
      <div class="full"><label>Título</label><input name="title" value="${item?.title || ''}"></div>
      <div class="full"><label>Subtítulo</label><textarea name="subtitle">${item?.subtitle || ''}</textarea></div>
      ${richEditor('Contenido', 'item-content-editor', item?.content || '')}
      <div><label>Texto botón</label><input name="button_label" value="${item?.button_label || ''}"></div>
      <div><label>URL botón</label><input name="button_url" value="${item?.button_url || ''}"></div>
      <div><label>Badge</label><input name="badge" value="${item?.badge || ''}"></div>
      <div><label>Ícono</label><input name="icon" value="${item?.icon || ''}"></div>
      <div><label>Precio</label><input name="price" type="number" value="${item?.price || ''}"></div>
      <div><label>Precio anterior</label><input name="old_price" type="number" value="${item?.old_price || ''}"></div>
      <div><label>Imagen URL</label><input id="cms-image-url" name="image_url" value="${item?.image_url || ''}"></div>
      <div><label>Alt imagen</label><input id="cms-image-alt" name="image_alt" value="${item?.image_alt || ''}"></div>
      ${buildMediaHelper(section)}
      <div class="full cms-upload-box">
        <label>Subir / cambiar imagen</label>
        <div class="cms-upload-row">
          <input id="cms-file-input" type="file" accept="image/*">
          <button id="cms-upload-btn" type="button" class="btn btn-dark">Subir imagen</button>
        </div>
        <div id="cms-upload-status" class="cms-upload-status">Si ya tienes URL, puedes pegarla manualmente. Si no, sube la imagen aquí.</div>
        <div id="cms-upload-preview" class="cms-upload-preview">${item?.image_url ? `<img src="${item.image_url}" alt="preview">` : '<div class="empty-state">Sin preview</div>'}</div>
      </div>
      <div><label>Orden</label><input name="sort_order" type="number" value="${item?.sort_order || 100}"></div>
      <div><label>Activo</label><select name="is_active"><option value="true" ${item?.is_active !== false ? 'selected' : ''}>Sí</option><option value="false" ${item?.is_active === false ? 'selected' : ''}>No</option></select></div>
      <div class="full"><label>JSON extra (opcional)</label><textarea name="extra_json">${escapeHtml(JSON.stringify(extra, null, 2))}</textarea></div>
      <div class="cms-form-actions full">
        <button type="button" class="btn btn-dark" data-close-modal="true">Cancelar</button>
        <button type="submit" class="btn">Guardar ítem</button>
      </div>
    </form>
  `, (body) => {
    bindToolbar(body);
    const uploadBtn = body.querySelector('#cms-upload-btn');
    const fileInput = body.querySelector('#cms-file-input');
    const status = body.querySelector('#cms-upload-status');
    const preview = body.querySelector('#cms-upload-preview');
    const imageUrlInput = body.querySelector('#cms-image-url');
    const imageAltInput = body.querySelector('#cms-image-alt');

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const localUrl = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${localUrl}" alt="preview">`;
      status.textContent = `Lista para subir: ${file.name}`;
    });

    uploadBtn?.addEventListener('click', async () => {
      const file = fileInput.files?.[0];
      if (!file) return setAlert('Selecciona una imagen antes de subir.', 'error');
      try {
        uploadBtn.disabled = true;
        status.textContent = 'Subiendo imagen...';
        const result = await uploadCmsImage(file, getMediaFolder(section), imageAltInput.value || item?.title || '');
        imageUrlInput.value = result.file_url;
        preview.innerHTML = `<img src="${result.file_url}" alt="preview">`;
        status.textContent = 'Imagen subida correctamente y lista para guardar en el ítem.';
      } catch (error) {
        status.textContent = 'Error subiendo imagen.';
        setAlert(error.message, 'error');
      } finally {
        uploadBtn.disabled = false;
      }
    });

    body.querySelector('#cms-item-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.is_active = payload.is_active === 'true';
      payload.sort_order = Number(payload.sort_order || 100);
      payload.price = payload.price ? Number(payload.price) : null;
      payload.old_price = payload.old_price ? Number(payload.old_price) : null;
      payload.content = body.querySelector('#item-content-editor').innerHTML;
      try {
        payload.extra_json = JSON.parse(payload.extra_json || '{}');
      } catch (_) {
        return setAlert('El campo JSON extra no tiene formato válido.', 'error');
      }
      try {
        if (item?.id) {
          await api(`/admin/cms/items/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
          await api('/admin/cms/items', { method: 'POST', body: JSON.stringify(payload) });
        }
        closeModal();
        await loadPageDetail(state.currentPageSlug);
        setAlert('Ítem guardado correctamente.');
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  });
}

function openImageModal(section, item) {
  openModal(`Cambiar imagen: ${item.title || item.item_key}`, `
    <form id="cms-image-form" class="cms-form-grid">
      <div class="full cms-upload-preview big">${item.image_url ? `<img src="${item.image_url}" alt="preview">` : '<div class="empty-state">Sin preview</div>'}</div>
      <div class="full"><label>Alt actual</label><input id="image-alt-quick" value="${item.image_alt || item.title || ''}"></div>
      <div class="full cms-upload-row">
        <input id="cms-image-change-input" type="file" accept="image/*">
        <button type="button" id="cms-image-change-upload" class="btn">Subir y guardar</button>
      </div>
      <div id="cms-image-change-status" class="cms-upload-status">Puedes reemplazar la imagen de este bloque sin tocar la URL manualmente.</div>
    </form>
  `, (body) => {
    const input = body.querySelector('#cms-image-change-input');
    const btn = body.querySelector('#cms-image-change-upload');
    const status = body.querySelector('#cms-image-change-status');
    const preview = body.querySelector('.cms-upload-preview');
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="preview">`;
      status.textContent = `Lista para subir: ${file.name}`;
    });
    btn.addEventListener('click', async () => {
      const file = input.files?.[0];
      if (!file) return setAlert('Selecciona una imagen antes de subir.', 'error');
      try {
        btn.disabled = true;
        status.textContent = 'Subiendo imagen...';
        const upload = await uploadCmsImage(file, getMediaFolder(section), body.querySelector('#image-alt-quick').value || item.title || '');
        const payload = {
          ...item,
          image_url: upload.file_url,
          image_alt: body.querySelector('#image-alt-quick').value || item.title || '',
          extra_json: item.extra_json || {},
        };
        await api(`/admin/cms/items/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        closeModal();
        await loadPageDetail(state.currentPageSlug);
        setAlert('Imagen actualizada correctamente.');
      } catch (error) {
        status.textContent = 'Error subiendo imagen.';
        setAlert(error.message, 'error');
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function openProductModal(isOfferMode = false, product = null) {
  const isEdit = !!product;
  const galleryValue = Array.isArray(product?.gallery) ? product.gallery.join('\n') : '';
  const specsValue = product?.specs ? JSON.stringify(product.specs, null, 2) : '{}';
  openModal(isEdit ? `Editar producto: ${product.name}` : (isOfferMode ? 'Nueva oferta' : 'Nuevo producto'), `
    <form id="product-form" class="cms-form-grid">
      <div class="full cms-media-helper">
        <strong>${isOfferMode ? 'Modo oferta' : 'Modo producto'}</strong>
        <p>${isOfferMode ? 'Las ofertas reales se construyen sobre productos. Para que aparezcan en la página de ofertas, define precio y precio anterior.' : 'Este formulario modifica la tabla products real. Lo que guardes aquí impacta el catálogo público.'}</p>
      </div>
      <div><label>Nombre</label><input name="name" required value="${escapeHtml(product?.name || '')}"></div>
      <div><label>Slug (opcional)</label><input name="slug" value="${escapeHtml(product?.slug || '')}"></div>
      <div><label>Categoría</label><input name="category" value="${escapeHtml(product?.category || (isOfferMode ? 'Oferta' : 'Enduro'))}"></div>
      <div><label>Estado comercial</label><input name="status" value="${escapeHtml(product?.status || 'Disponible')}"></div>
      <div><label>Orden</label><input name="sort_order" type="number" value="${product?.sort_order ?? 100}"></div>
      <div><label>Stock</label><input name="stock" type="number" value="${product?.stock ?? 0}"></div>
      <div><label>Precio actual</label><input name="price" type="number" value="${product?.price ?? ''}"></div>
      <div><label>Precio anterior</label><input name="old_price" type="number" value="${product?.old_price ?? ''}"></div>
      <div><label>Marca</label><input name="brand" value="${escapeHtml(product?.brand || 'KAYO')}"></div>
      <div><label>Motor (cc)</label><input name="engine_cc" type="number" value="${product?.engine_cc ?? ''}"></div>
      <div><label>Tipo de motor</label><input name="engine_type" value="${escapeHtml(product?.engine_type || '')}"></div>
      <div><label>Transmisión</label><input name="transmission" value="${escapeHtml(product?.transmission || '')}"></div>
      <div><label>Encendido</label><input name="start_type" value="${escapeHtml(product?.start_type || '')}"></div>
      <div><label>Imagen URL</label><input id="product-image-url" name="image_url" value="${escapeHtml(product?.image_url || '')}"></div>
      <div><label>Subir imagen nueva</label><input id="product-image-file" type="file" accept="image/*"></div>
      <div><label>Destacado</label><select name="featured"><option value="false" ${product?.featured ? '' : 'selected'}>No</option><option value="true" ${product?.featured ? 'selected' : ''}>Sí</option></select></div>
      <div><label>Activo</label><select name="is_active"><option value="true" ${product?.is_active === false ? '' : 'selected'}>Sí</option><option value="false" ${product?.is_active === false ? 'selected' : ''}>No</option></select></div>
      <div class="full"><label>Descripción corta</label><textarea name="short_description">${escapeHtml(product?.short_description || '')}</textarea></div>
      ${richEditor('Descripción larga', 'product-description-editor', product?.description || '')}
      <div class="full"><label>Galería (una URL por línea)</label><textarea name="gallery_urls">${escapeHtml(galleryValue)}</textarea></div>
      <div class="full"><label>Specs JSON</label><textarea name="specs">${escapeHtml(specsValue)}</textarea></div>
      <div><label>Link pago</label><input name="payment_link" value="${escapeHtml(product?.payment_link || '')}"></div>
      <div><label>Brochure URL</label><input name="brochure_url" value="${escapeHtml(product?.brochure_url || '')}"></div>
      <div class="cms-form-actions full">
        <button type="button" class="btn btn-dark" data-close-modal="true">Cancelar</button>
        <button type="submit" class="btn">Guardar producto</button>
      </div>
    </form>
  `, (body) => {
    bindToolbar(body);
    body.querySelector('#product-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const file = body.querySelector('#product-image-file')?.files?.[0] || null;
      try {
        const description = body.querySelector('#product-description-editor').innerHTML;
        const formData = new FormData(form);
        formData.set('description', description);
        if (file) formData.append('image', file);
        await saveProduct(formData, product?.id || null, true);
        closeModal();
        await loadPageDetail(state.currentPageSlug);
        setAlert('Producto guardado correctamente.');
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  });
}

async function saveProduct(payload, productId = null, isFormData = false) {
  const path = productId ? `/productos/${productId}` : '/productos';
  return api(path, { method: productId ? 'PUT' : 'POST', body: payload, headers: isFormData ? {} : undefined });
}

function openNewsModal(article = null) {
  openModal(article ? `Editar noticia: ${article.title}` : 'Nueva noticia', `
    <form id="news-form" class="cms-form-grid">
      <div><label>Título</label><input name="title" required value="${escapeHtml(article?.title || '')}"></div>
      <div><label>Slug (opcional)</label><input name="slug" value="${escapeHtml(article?.slug || '')}"></div>
      <div><label>Autor</label><input name="author" value="${escapeHtml(article?.author || 'Allmate Motors')}"></div>
      <div><label>Fecha publicación</label><input name="published_at" type="datetime-local" value="${toInputDateTime(article?.published_at)}"></div>
      <div><label>Activo</label><select name="is_active"><option value="true" ${article?.is_active === false ? '' : 'selected'}>Sí</option><option value="false" ${article?.is_active === false ? 'selected' : ''}>No</option></select></div>
      <div><label>Imagen URL</label><input id="news-image-url" name="image_url" value="${escapeHtml(article?.image_url || '')}"></div>
      <div><label>Subir imagen</label><input id="news-image-file" type="file" accept="image/*"></div>
      <div class="full"><label>Extracto</label><textarea name="excerpt">${escapeHtml(article?.excerpt || '')}</textarea></div>
      ${richEditor('Contenido noticia', 'news-content-editor', article?.content || '')}
      <div class="cms-form-actions full">
        <button type="button" class="btn btn-dark" data-close-modal="true">Cancelar</button>
        <button type="submit" class="btn">Guardar noticia</button>
      </div>
    </form>
  `, (body) => {
    bindToolbar(body);
    body.querySelector('#news-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.content = body.querySelector('#news-content-editor').innerHTML;
      try {
        const file = body.querySelector('#news-image-file')?.files?.[0] || null;
        if (file) {
          const upload = await uploadCmsImage(file, 'news', payload.title || 'noticia');
          payload.image_url = upload.file_url;
        }
        await saveNews(payload, false, article?.id || null);
        closeModal();
        await loadPageDetail('news');
        setAlert('Noticia guardada correctamente.');
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  });
}

async function saveNews(payload, partial = false, articleId = null) {
  const normalized = partial ? payload : {
    ...payload,
    is_active: payload.is_active === true || payload.is_active === 'true',
  };
  const path = articleId ? `/news/admin/${articleId}` : '/news/admin';
  return api(path, { method: articleId ? 'PUT' : 'POST', body: JSON.stringify(normalized) });
}

async function moveItem(itemId, direction) {
  try {
    await api(`/admin/cms/items/${itemId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    });
    await loadPageDetail(state.currentPageSlug);
    setAlert(`Ítem movido ${direction === 'up' ? 'hacia arriba' : 'hacia abajo'}.`);
  } catch (error) {
    setAlert(error.message, 'error');
  }
}

async function toggleItem(itemId) {
  try {
    const result = await api(`/admin/cms/items/${itemId}/toggle`, { method: 'PATCH' });
    await loadPageDetail(state.currentPageSlug);
    setAlert(`Ítem ${result.is_active ? 'activado' : 'ocultado'} correctamente.`);
  } catch (error) {
    setAlert(error.message, 'error');
  }
}

function openSettingsModal() {
  const rows = state.settings.map((setting) => `
    <div class="cms-item-card">
      <div class="cms-item-top">
        <div>
          <span class="cms-chip">${escapeHtml(setting.setting_group)}</span>
          <h5>${escapeHtml(setting.setting_key)}</h5>
        </div>
        <button class="btn btn-dark js-edit-setting" type="button" data-key="${setting.setting_key}">Editar</button>
      </div>
      <div style="margin-top:10px; color:#fff;">${escapeHtml(setting.setting_value || '')}</div>
    </div>
  `).join('');

  openModal('Ajustes globales', `
    <div class="cms-sections-wrap">${rows}</div>
  `, (body) => {
    body.querySelectorAll('.js-edit-setting').forEach((btn) => {
      btn.addEventListener('click', () => {
        const setting = state.settings.find((row) => row.setting_key === btn.dataset.key);
        openSettingEditor(setting);
      });
    });
  });
}

function openSettingEditor(setting) {
  openModal(`Editar setting: ${setting.setting_key}`, `
    <form id="cms-setting-form" class="cms-form-grid">
      <div><label>Grupo</label><input name="setting_group" value="${escapeHtml(setting.setting_group || 'general')}"></div>
      <div><label>Público</label><select name="is_public"><option value="true" ${setting.is_public !== false ? 'selected' : ''}>Sí</option><option value="false" ${setting.is_public === false ? 'selected' : ''}>No</option></select></div>
      <div class="full"><label>Valor</label><textarea name="setting_value">${escapeHtml(setting.setting_value || '')}</textarea></div>
      <div class="cms-form-actions full">
        <button type="button" class="btn btn-dark" data-close-modal="true">Cancelar</button>
        <button type="submit" class="btn">Guardar setting</button>
      </div>
    </form>
  `, (body) => {
    body.querySelector('#cms-setting-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      payload.is_public = payload.is_public === 'true';
      try {
        await api(`/admin/cms/settings/${setting.setting_key}`, { method: 'PUT', body: JSON.stringify(payload) });
        closeModal();
        await loadPageDetail(state.currentPageSlug);
        setAlert('Setting guardado correctamente.');
      } catch (error) {
        setAlert(error.message, 'error');
      }
    });
  });
}

document.addEventListener('click', (event) => {
  if (event.target.matches('[data-close-modal="true"]')) closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const hasToken = !!getToken();
  document.getElementById('login-view').style.display = hasToken ? 'none' : 'block';
  document.getElementById('dashboard-view').style.display = hasToken ? 'block' : 'none';
  document.getElementById('logout-btn').style.display = hasToken ? 'inline-flex' : 'none';
  if (hasToken) bootDashboard();

  document.getElementById('login-form')?.addEventListener('submit', loginAdmin);
  document.getElementById('btn-new-page')?.addEventListener('click', () => openPageModal(null));
  document.getElementById('btn-edit-page')?.addEventListener('click', () => state.currentPage && openPageModal(state.currentPage));
  document.getElementById('btn-new-section')?.addEventListener('click', () => state.currentPage && openSectionModal(null));
  document.getElementById('btn-open-settings')?.addEventListener('click', openSettingsModal);
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('allmate_admin_token');
    location.reload();
  });
});

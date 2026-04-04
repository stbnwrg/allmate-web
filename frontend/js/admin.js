const API = '/api';
const MEDIA_SECTIONS = ['hero', 'carrusel_visual'];
const state = {
  pages: [],
  currentPageSlug: null,
  currentPage: null,
  sections: [],
  settings: [],
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

function isMediaSection(section) {
  return MEDIA_SECTIONS.includes(section.section_key);
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
  if (helper) {
    helper.innerHTML = isMediaSection(section)
      ? '<span class="cms-inline-hint">Sección multimedia: agrega, cambia, reordena y activa/desactiva slides e imágenes sin tocar código.</span>'
      : '<span class="cms-inline-hint">Sección de contenido: puedes editar copy, CTAs, imagen y estado de cada bloque.</span>';
  }

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
    ${item.price ? `<p><strong>Precio:</strong> $${Number(item.price).toLocaleString('es-CL')}</p>` : ''}
    ${item.old_price ? `<p><strong>Precio anterior:</strong> $${Number(item.old_price).toLocaleString('es-CL')}</p>` : ''}
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

function renderSections() {
  const wrap = document.getElementById('cms-sections-wrap');
  document.getElementById('cms-page-title').textContent = state.currentPage?.name || 'Selecciona una página';
  renderMeta();
  if (!state.sections.length) {
    wrap.innerHTML = '<div class="empty-state">Esta página todavía no tiene secciones.</div>';
    return;
  }
  wrap.innerHTML = '';
  state.sections.forEach((section) => wrap.appendChild(renderSectionCard(section)));
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

async function loadPageDetail(slug) {
  try {
    const payload = await api(`/admin/cms/pages/${slug}`);
    state.currentPageSlug = slug;
    state.currentPage = payload.page;
    state.sections = payload.sections;
    state.settings = payload.settings;
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
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.is_active = payload.is_active === 'true';
      payload.sort_order = Number(payload.sort_order || 100);
      try {
        await api('/admin/cms/pages', { method: 'POST', body: JSON.stringify(payload) });
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
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.is_active = payload.is_active === 'true';
      payload.sort_order = Number(payload.sort_order || 100);
      payload.content = body.querySelector('#section-content-editor').innerHTML;
      try {
        await api('/admin/cms/sections', { method: 'POST', body: JSON.stringify(payload) });
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
  if (section.section_key === 'hero') return 'hero';
  if (section.section_key === 'carrusel_visual') return 'carrusel';
  return section.section_key || 'general';
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
  const isMedia = isMediaSection(section);
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
        await api('/admin/cms/items', { method: 'POST', body: JSON.stringify(payload) });
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
        await api('/admin/cms/items', { method: 'POST', body: JSON.stringify(payload) });
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
      <div><label>Grupo</label><input name="setting_group" value="${setting.setting_group || 'general'}"></div>
      <div><label>Público</label><select name="is_public"><option value="true" ${setting.is_public !== false ? 'selected' : ''}>Sí</option><option value="false" ${setting.is_public === false ? 'selected' : ''}>No</option></select></div>
      <div class="full"><label>Valor</label><textarea name="setting_value">${setting.setting_value || ''}</textarea></div>
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

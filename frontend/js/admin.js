const API = '/api';

function getToken() {
  return localStorage.getItem('allmate_admin_token');
}

function setAlert(message, type = 'success') {
  const box = document.getElementById('admin-alert');
  box.className = `alert show ${type}`;
  box.textContent = message;
}

function moneyCLP(value) {
  if (!value) return 'Consultar';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value));
}

async function loginAdmin(event) {
  event.preventDefault();

  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('admin_email').value,
      password: document.getElementById('admin_password').value
    })
  });

  const data = await res.json();
  if (!res.ok) return setAlert(data.message || 'Credenciales inválidas', 'error');

  localStorage.setItem('allmate_admin_token', data.token);
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('dashboard-view').style.display = 'block';
  bootDashboard();
}

async function loadAdminProducts() {
  const res = await fetch(`${API}/productos/admin`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const items = res.ok ? await res.json() : [];
  document.getElementById('kpi-products').textContent = items.length;
  document.getElementById('kpi-featured').textContent = items.filter(item => item.featured).length;
  document.getElementById('kpi-stock').textContent = items.reduce((acc, item) => acc + Number(item.stock || 0), 0);

  document.getElementById('admin-products').innerHTML = items.length
    ? items.map(item => `
        <div class="admin-product-row">
          <div>
            <strong>${item.name}</strong><br>
            <small>${item.category} · ${item.engine_cc || '-'} cc · ${item.status || 'Consultar'}</small>
          </div>
          <div style="text-align:right;">
            <strong>${moneyCLP(item.price)}</strong><br>
            <small>stock ${item.stock || 0}</small>
          </div>
        </div>
      `).join('')
    : '<div class="empty-state">No hay productos cargados.</div>';
}

async function loadHeroSlides() {
  const res = await fetch(`${API}/hero/admin`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const items = res.ok ? await res.json() : [];

  document.getElementById('hero-list').innerHTML = items.length
    ? items.map(item => `
        <div class="admin-product-row">
          <div>
            <strong>#${item.sort_order} ${item.title}</strong><br>
            <small>${item.subtitle || 'Sin subtítulo'}</small>
          </div>
          <div>
            <button class="btn btn-dark" onclick="deleteHero(${item.id})">Ocultar</button>
          </div>
        </div>
      `).join('')
    : '<div class="empty-state">No hay slides hero cargados.</div>';
}

async function createProduct(event) {
  event.preventDefault();
  const form = document.getElementById('product-form');
  const formData = new FormData(form);

  formData.append('specs', JSON.stringify({
    frenos: document.getElementById('spec_frenos').value,
    llantas: document.getElementById('spec_llantas').value,
    combustible: document.getElementById('spec_combustible').value,
    potencia: document.getElementById('spec_potencia').value,
    observacion: document.getElementById('spec_observacion').value
  }));

  const res = await fetch(`${API}/productos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) return setAlert(data.message || 'No se pudo crear el producto', 'error');

  setAlert('Producto creado correctamente.');
  form.reset();
  loadAdminProducts();
}

async function publishNews(event) {
  event.preventDefault();

  const payload = {
    title: document.getElementById('news_title').value,
    excerpt: document.getElementById('news_excerpt').value,
    content: document.getElementById('news_content').value,
    image_url: document.getElementById('news_image').value
  };

  const res = await fetch(`${API}/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) return setAlert(data.message || 'No se pudo publicar la noticia', 'error');
  setAlert('Noticia publicada correctamente.');
  document.getElementById('news-form').reset();
}

async function createHeroSlide(event) {
  event.preventDefault();
  const formData = new FormData(document.getElementById('hero-form'));

  const res = await fetch(`${API}/hero`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) return setAlert(data.message || 'No se pudo crear el slide', 'error');
  setAlert('Slide hero creado correctamente.');
  document.getElementById('hero-form').reset();
  loadHeroSlides();
}

async function deleteHero(id) {
  const res = await fetch(`${API}/hero/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) return setAlert(data.message || 'No se pudo ocultar el slide', 'error');
  setAlert('Slide ocultado correctamente.');
  loadHeroSlides();
}

function bootDashboard() {
  loadAdminProducts();
  loadHeroSlides();
}

document.addEventListener('DOMContentLoaded', () => {
  const hasToken = !!getToken();
  document.getElementById('login-view').style.display = hasToken ? 'none' : 'block';
  document.getElementById('dashboard-view').style.display = hasToken ? 'block' : 'none';
  if (hasToken) bootDashboard();

  document.getElementById('login-form')?.addEventListener('submit', loginAdmin);
  document.getElementById('product-form')?.addEventListener('submit', createProduct);
  document.getElementById('news-form')?.addEventListener('submit', publishNews);
  document.getElementById('hero-form')?.addEventListener('submit', createHeroSlide);
});

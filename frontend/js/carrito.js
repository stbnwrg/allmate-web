function removeItem(id) {
  const cart = getCart().filter(item => item.id !== id);
  setCart(cart);
  renderCart();
}

function updateQty(id, delta) {
  const cart = getCart().map(item => {
    if (item.id === id) {
      return { ...item, quantity: Math.max(1, Number(item.quantity || 1) + delta) };
    }
    return item;
  });
  setCart(cart);
  renderCart();
}

function buildWhatsAppOrderMessage(items, total) {
  const customerName = document.getElementById('customer_name')?.value || 'Cliente web';
  const detail = items.map(item => `- ${item.name} x${item.quantity} (${currencyCLP(item.price)})`).join('%0A');
  return `Hola Allmate, quiero gestionar este pedido:%0A%0A${detail}%0A%0ATotal estimado: ${currencyCLP(total)}%0ACliente: ${customerName}`;
}

function renderCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = '<div class="empty-state">Tu carrito está vacío. Parte por el catálogo y agrega el modelo que te interese.</div>';
    document.getElementById('summary-count').textContent = '0';
    document.getElementById('summary-subtotal').textContent = '$0';
    document.getElementById('summary-total').textContent = '$0';
    return;
  }

  container.innerHTML = cart.map(item => `
    <article class="cart-item">
      <img src="${safeImage(item.image_url)}" alt="${item.name}">
      <div>
        <h3 style="margin:0 0 8px;">${item.name}</h3>
        <div style="color:#bcbcbc;">${currencyCLP(item.price)}</div>
        <div class="qty-box">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
          <strong>${item.quantity}</strong>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <div style="text-align:right;">
        <strong>${currencyCLP((item.price || 0) * item.quantity)}</strong><br>
        <button class="btn btn-dark" style="margin-top:10px;" onclick="removeItem(${item.id})">Quitar</button>
      </div>
    </article>
  `).join('');

  const total = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0), 0);
  document.getElementById('summary-count').textContent = String(cart.reduce((acc, item) => acc + Number(item.quantity || 0), 0));
  document.getElementById('summary-subtotal').textContent = currencyCLP(total);
  document.getElementById('summary-total').textContent = currencyCLP(total);

  document.getElementById('payment-note').textContent = window.SITE_CONFIG.payment.note;
  document.getElementById('general-payment-link').href = window.SITE_CONFIG.payment.generalLink;

  const waUrl = `https://wa.me/${window.SITE_CONFIG.contact.whatsappNumber.replace(/\D/g, '')}?text=${buildWhatsAppOrderMessage(cart, total)}`;
  document.getElementById('checkout-whatsapp').href = waUrl;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.getElementById('checkout-form')?.addEventListener('input', renderCart);
});

(function () {
  function currency(value) {
    if (typeof window.currencyCLP === "function") return window.currencyCLP(value);
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function getCartItems() {
    if (typeof window.getCart === "function") return window.getCart();
    try { return JSON.parse(localStorage.getItem("allmate_cart") || "[]"); } catch { return []; }
  }

  function saveCartItems(items) {
    if (typeof window.setCart === "function") {
      window.setCart(items);
      return;
    }
    localStorage.setItem("allmate_cart", JSON.stringify(items));
  }

  function cartImage(item) {
    const src = item.image || item.image_url || "";
    if (!src) {
      return '<div class="cart-item-media cart-item-media-empty"><span>Imagen pendiente</span></div>';
    }
    return `<div class="cart-item-media"><img src="${src}" alt="${item.name || 'Producto'}" loading="lazy" onerror="this.closest('.cart-item-media').classList.add('cart-item-media-empty');this.remove();"></div>`;
  }

  function itemKey(item) {
    return item.slug || item.id || item.name;
  }

  function findWhatsappNumber() {
    const cfg = window.SITE_CONFIG || window.SITE || {};
    const raw = cfg?.contact?.whatsappNumber || cfg?.contact?.telephone || "56992178719";
    return String(raw).replace(/\D/g, "") || "56992178719";
  }

  function paymentLink() {
    const cfg = window.SITE_CONFIG || window.SITE || {};
    return cfg?.payment?.generalLink || "https://www.webpay.cl/form-pay/204308";
  }

  function paymentNote() {
    const cfg = window.SITE_CONFIG || window.SITE || {};
    return cfg?.payment?.note || "Pago online disponible. Si prefieres, envía primero tu pedido por WhatsApp y coordinamos el cierre.";
  }

  function buildWhatsappMessage(items, total) {
    const customerName = document.getElementById("customer_name")?.value?.trim() || "Cliente web";
    const detail = items.map((item) => `- ${item.name} x${item.quantity} (${currency(item.price)})`).join("\n");
    return encodeURIComponent(`Hola Allmate, quiero gestionar este pedido:\n\n${detail}\n\nTotal estimado: ${currency(total)}\nCliente: ${customerName}`);
  }

  function removeItem(key) {
    const items = getCartItems().filter((item) => itemKey(item) !== key);
    saveCartItems(items);
    renderCart();
  }

  function updateQty(key, delta) {
    const items = getCartItems().map((item) => {
      if (itemKey(item) !== key) return item;
      const nextQty = Math.max(1, Number(item.quantity || 1) + delta);
      return { ...item, quantity: nextQty };
    });
    saveCartItems(items);
    renderCart();
  }

  function emptyCart() {
    saveCartItems([]);
    renderCart();
  }

  function renderStatusMessage() {
    const mount = document.getElementById("cart-status-message");
    if (!mount) return;

    const status = new URLSearchParams(window.location.search).get("status");
    if (!status) {
      mount.innerHTML = "";
      return;
    }

    const map = {
      ok: {
        cls: "cart-alert success",
        text: "Pago recibido o flujo completado. Revisa con Allmate la confirmación final del pedido."
      },
      abortado: {
        cls: "cart-alert warn",
        text: "El pago fue cancelado o interrumpido. Tu carrito sigue intacto para que retomes cuando quieras."
      },
      error: {
        cls: "cart-alert error",
        text: "Ocurrió un problema en el pago. Tu carrito sigue guardado."
      }
    };

    const current = map[status] || map.error;
    mount.innerHTML = `<div class="${current.cls}">${current.text}</div>`;
  }

  function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    const items = getCartItems();
    const summaryCount = document.getElementById("summary-count");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryTotal = document.getElementById("summary-total");
    const paymentNoteNode = document.getElementById("payment-note");
    const paymentLinkNode = document.getElementById("general-payment-link");
    const whatsappNode = document.getElementById("checkout-whatsapp");

    const total = items.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const count = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

    if (summaryCount) summaryCount.textContent = String(count);
    if (summarySubtotal) summarySubtotal.textContent = currency(total);
    if (summaryTotal) summaryTotal.textContent = currency(total);
    if (paymentNoteNode) paymentNoteNode.textContent = paymentNote();
    if (paymentLinkNode) paymentLinkNode.href = paymentLink();

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>Tu carrito está vacío</h2>
          <p>Parte por el catálogo, agrega el modelo que te interese y vuelve acá para revisar el pedido.</p>
          <a class="btn" href="productos.html">Ir a productos</a>
        </div>
      `;
      if (whatsappNode) whatsappNode.href = `https://wa.me/${findWhatsappNumber()}?text=${encodeURIComponent("Hola Allmate, necesito ayuda para elegir una moto KAYO.")}`;
      return;
    }

    container.innerHTML = items.map((item) => {
      const key = JSON.stringify(itemKey(item));
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return `
        <article class="cart-item">
          ${cartImage(item)}
          <div class="cart-item-copy">
            <div class="cart-item-top">
              <div>
                <h3>${item.name || "Producto sin nombre"}</h3>
                ${item.slug ? `<a class="text-link" href="producto.html?slug=${encodeURIComponent(item.slug)}">Ver ficha técnica</a>` : ""}
              </div>
              <strong class="cart-item-line-total">${currency(lineTotal)}</strong>
            </div>
            <div class="cart-item-meta">
              <span>Precio unitario: ${currency(item.price)}</span>
            </div>
            <div class="cart-item-actions">
              <div class="qty-box">
                <button class="qty-btn" type="button" onclick='window.updateCartQty(${key}, -1)'>−</button>
                <strong>${Number(item.quantity || 1)}</strong>
                <button class="qty-btn" type="button" onclick='window.updateCartQty(${key}, 1)'>+</button>
              </div>
              <button class="btn btn-dark btn-sm" type="button" onclick='window.removeCartItem(${key})'>Quitar</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    if (whatsappNode) {
      whatsappNode.href = `https://wa.me/${findWhatsappNumber()}?text=${buildWhatsappMessage(items, total)}`;
    }
  }

  window.removeCartItem = removeItem;
  window.updateCartQty = updateQty;

  document.addEventListener("DOMContentLoaded", () => {
    renderStatusMessage();
    renderCart();

    document.getElementById("checkout-form")?.addEventListener("input", renderCart);
    document.getElementById("empty-cart-btn")?.addEventListener("click", emptyCart);

    window.addEventListener("storage", (event) => {
      if (event.key === "allmate_cart") renderCart();
    });
  });
})();

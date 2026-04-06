(function(){
  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-contact-status]');
  if (!form) return;

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? '#ffb3b3' : '#d8f6dc';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(form).entries());

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('Completa nombre, correo y mensaje.', true);
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      setStatus('Enviando mensaje...');

      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar el mensaje.');

      form.reset();
      setStatus('Mensaje enviado correctamente. Te responderemos a la brevedad.');
    } catch (error) {
      setStatus(error.message || 'Error al enviar el formulario.', true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();

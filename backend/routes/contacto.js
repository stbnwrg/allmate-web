const express = require('express');
const https = require('https');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

let contactTableReady = false;

async function ensureContactTable() {
  if (contactTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(120) NOT NULL,
      phone VARCHAR(40),
      subject VARCHAR(160),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  contactTableReady = true;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendBrevoEmail({ name, email, phone, subject, message }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return reject(new Error('BREVO_API_KEY no configurada.'));
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'contacto@allmate.cl';
    const senderName = process.env.BREVO_SENDER_NAME || 'Allmate Motors';
    const receiverEmail = process.env.CONTACT_RECEIVER || process.env.SMTP_USER || 'contacto@allmate.cl';

    const payload = JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: receiverEmail,
          name: senderName,
        },
      ],
      replyTo: {
        email,
        name,
      },
      subject: `[Web Allmate] ${subject || 'Nuevo contacto'}`,
      htmlContent: `
        <h2>Nuevo mensaje desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(phone || '-')}</p>
        <p><strong>Asunto:</strong> ${escapeHtml(subject || '-')}</p>
        <p><strong>Mensaje:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
      textContent: [
        'Nuevo mensaje desde el sitio web',
        `Nombre: ${name}`,
        `Email: ${email}`,
        `Teléfono: ${phone || '-'}`,
        `Asunto: ${subject || '-'}`,
        `Mensaje: ${message}`,
      ].join('\n'),
    });

    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'api-key': apiKey,
          Accept: 'application/json',
        },
        timeout: 10000,
      },
      (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body ? JSON.parse(body) : {});
            return;
          }

          reject(new Error(`Brevo respondió ${res.statusCode}: ${body}`));
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Timeout al conectar con Brevo.'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nombre, correo y mensaje son obligatorios.' });
    }

    await ensureContactTable();

    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)`,
      [name.trim(), email.trim(), phone?.trim() || null, subject?.trim() || 'Formulario web', message.trim()]
    );

    // Responder rápido al frontend y enviar el correo en segundo plano.
    res.json({ message: 'Mensaje enviado correctamente' });

    if (process.env.BREVO_API_KEY) {
      sendBrevoEmail({ name, email, phone, subject, message })
        .then(() => {
          console.log('[contacto] Correo de formulario enviado por Brevo correctamente.');
        })
        .catch((error) => {
          console.error('[contacto] Error enviando correo con Brevo:', error.message);
        });
      return;
    }

    console.warn('[contacto] BREVO_API_KEY no configurada. El mensaje se guardó en la BD, pero no se envió correo.');
  } catch (error) {
    console.error('[contacto] Error al procesar formulario:', error.message);
    res.status(500).json({ message: 'Error al enviar contacto', error: error.message });
  }
});

module.exports = router;

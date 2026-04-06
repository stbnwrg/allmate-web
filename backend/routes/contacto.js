const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

function buildTransporter() {
  const smtpReady = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!smtpReady) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
}

async function sendContactMail({ name, email, phone, subject, message }) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.warn('[contacto] SMTP no configurado. Se omite envío de correo.');
    return;
  }

  const receiver = process.env.CONTACT_RECEIVER || process.env.SMTP_USER || 'contacto@allmate.cl';

  await transporter.sendMail({
    from: `Sitio Allmate <${process.env.SMTP_USER}>`,
    to: receiver,
    replyTo: email,
    subject: `[Web Allmate] ${subject || 'Nuevo contacto'}`,
    html: `
      <h2>Nuevo mensaje desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone || '-'}</p>
      <p><strong>Asunto:</strong> ${subject || '-'}</p>
      <p><strong>Mensaje:</strong><br>${String(message).replace(/\n/g, '<br>')}</p>
    `,
  });
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)`,
      [name.trim(), email.trim(), phone?.trim() || null, subject?.trim() || 'Formulario web', message.trim()]
    );

    res.json({ message: 'Mensaje enviado correctamente. Te responderemos a la brevedad.' });

    setImmediate(async () => {
      try {
        await sendContactMail({ name, email, phone, subject, message });
        console.log('[contacto] Correo de formulario enviado correctamente.');
      } catch (mailError) {
        console.error('[contacto] Error enviando correo:', mailError.message);
      }
    });
  } catch (error) {
    console.error('[contacto] Error general:', error.message);
    res.status(500).json({ message: 'Error al enviar contacto', error: error.message });
  }
});

module.exports = router;

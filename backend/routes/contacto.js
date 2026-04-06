const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

async function ensureContactMessagesTable() {
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
}

async function resolveContactReceiver() {
  if (process.env.CONTACT_RECEIVER) return process.env.CONTACT_RECEIVER;

  try {
    const result = await pool.query(
      `SELECT setting_value FROM site_settings WHERE setting_key = 'site_email' LIMIT 1`
    );
    const value = result.rows?.[0]?.setting_value;
    if (value) return value;
  } catch (error) {
    // site_settings may not exist in simpler installs; fallback below
  }

  return 'contacto@allmate.cl';
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nombre, correo y mensaje son obligatorios.' });
    }

    await ensureContactMessagesTable();

    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)`,
      [name, email, phone || null, subject || 'Formulario web', message]
    );

    const smtpReady = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!smtpReady) {
      return res.json({ message: 'Mensaje enviado correctamente', mailSent: false, stored: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const receiver = await resolveContactReceiver();

    try {
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
          <p><strong>Mensaje:</strong><br>${message}</p>
        `
      });
    } catch (mailError) {
      console.error('No se pudo enviar correo de contacto:', mailError.message);
      return res.json({
        message: 'Mensaje guardado correctamente. El correo no pudo enviarse en este momento.',
        mailSent: false,
        stored: true
      });
    }

    return res.json({ message: 'Mensaje enviado correctamente', mailSent: true, stored: true });
  } catch (error) {
    console.error('Error al enviar contacto:', error.message);
    return res.status(500).json({ message: 'Error al enviar contacto', error: error.message });
  }
});

module.exports = router;

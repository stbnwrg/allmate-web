const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)`,
      [name, email, phone || null, subject || 'Formulario web', message]
    );

    const smtpReady = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;
    if (smtpReady) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `Sitio Allmate <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
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
    }

    res.json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar contacto', error: error.message });
  }
});

module.exports = router;

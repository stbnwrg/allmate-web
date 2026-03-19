const express = require('express');
const pool = require('../config/db');
const { getTransaction } = require('../config/transbank');

const router = express.Router();

router.post('/webpay/crear', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'No hay productos en el carrito' });
    }

    const amount = items.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);
    const buyOrder = `ALLMATE-${Date.now()}`;
    const sessionId = `SESSION-${Date.now()}`;
    const returnUrl = process.env.WEBPAY_RETURN_URL;

    const tx = getTransaction();
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    await pool.query(
      `INSERT INTO orders (buy_order, customer_name, customer_email, customer_phone, amount, items, webpay_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [buyOrder, customer_name, customer_email, customer_phone || null, amount, JSON.stringify(items), response.token]
    );

    res.json({
      url: response.url,
      token: response.token,
      buyOrder,
      amount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar Webpay', error: error.message });
  }
});

router.all('/webpay/confirmar', async (req, res) => {
  try {
    const token = req.body?.token_ws || req.query?.token_ws;
    const abortedToken = req.body?.TBK_TOKEN || req.query?.TBK_TOKEN;

    if (abortedToken) {
      return res.redirect(`${process.env.FRONTEND_URL}/carrito.html?status=abortado`);
    }

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/carrito.html?status=error`);
    }

    const tx = getTransaction();
    const response = await tx.commit(token);

    await pool.query(
      `UPDATE orders SET status = $1, webpay_response = $2 WHERE webpay_token = $3`,
      [response.response_code === 0 ? 'paid' : 'rejected', JSON.stringify(response), token]
    );

    const orderResult = await pool.query(`SELECT buy_order FROM orders WHERE webpay_token = $1 LIMIT 1`, [token]);
    const buyOrder = orderResult.rows[0]?.buy_order || '';

    return res.redirect(`${process.env.FRONTEND_URL}/carrito.html?status=ok&buyOrder=${buyOrder}`);
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/carrito.html?status=error`);
  }
});

module.exports = router;

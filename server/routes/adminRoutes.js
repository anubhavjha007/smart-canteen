const express = require('express');
const { getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const { pool } = require('../config/db');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/orders', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS user_name
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email, u.student_id
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, mi.name AS item_name
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1`,
      [id]
    );

    return res.json({ success: true, data: { ...orderResult.rows[0], items: itemsResult.rows } });
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', updateOrderStatus);

router.get('/stats', async (req, res, next) => {
  try {
    const totals = await pool.query(`
      SELECT
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE order_status = 'PLACED') AS pending,
        COUNT(*) FILTER (WHERE order_status = 'ACCEPTED') AS accepted,
        COUNT(*) FILTER (WHERE order_status = 'PREPARING') AS preparing,
        COUNT(*) FILTER (WHERE order_status = 'READY') AS ready,
        COUNT(*) FILTER (WHERE order_status = 'COMPLETED') AS completed,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('day', NOW()) THEN total_amount ELSE 0 END), 0) AS today_revenue
      FROM orders
    `);

    return res.json({ success: true, data: totals.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

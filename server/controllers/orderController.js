const { pool } = require('../config/db');
const { createOrderFromCart, calculateTotals } = require('../services/orderService');
const { isValidQuantity } = require('../utils/validation');

function normalizeOrderRow(row) {
  return {
    ...row,
    subtotal: Number(row.subtotal),
    gst: Number(row.gst),
    total_amount: Number(row.total_amount),
  };
}

async function createOrder(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    const normalizedItems = items.map((item) => ({
      menuItemId: Number(item.menuItemId),
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedItems) {
      if (!Number.isInteger(item.menuItemId) || item.menuItemId <= 0) {
        return res.status(400).json({ success: false, message: 'Each menuItemId must be a valid positive integer' });
      }
      if (!isValidQuantity(item.quantity)) {
        return res.status(400).json({ success: false, message: 'Each quantity must be between 1 and 999' });
      }
    }

    const result = await createOrderFromCart(userId, normalizedItems);

    return res.status(201).json({
      success: true,
      data: {
        order: {
          ...result.order,
          subtotal: Number(result.order.subtotal),
          gst: Number(result.order.gst),
          total_amount: Number(result.order.total_amount),
        },
        items: result.items,
        totals: result.totals,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin
      ? 'SELECT * FROM orders ORDER BY created_at DESC'
      : 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 20';

    const result = await pool.query(query);
    const orders = result.rows.map(normalizeOrderRow);

    return res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';

    const query = isAdmin
      ? 'SELECT * FROM orders WHERE id = $1'
      : 'SELECT * FROM orders WHERE id = $1';
    const params = [id];
    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = normalizeOrderRow(result.rows[0]);
    const itemsResult = await pool.query(
      `SELECT oi.*, mi.name AS item_name, mi.image
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1`,
      [id]
    );

    return res.json({ success: true, data: { ...order, items: itemsResult.rows } });
  } catch (err) {
    next(err);
  }
}

async function payForOrder(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = result.rows[0];
    if (order.payment_status === 'PAID') {
      return res.status(409).json({ success: false, message: 'Order has already been paid' });
    }

    const updated = await pool.query(
      `UPDATE orders
       SET payment_status = 'PAID',
           order_status = CASE
             WHEN order_status = 'PLACED' THEN 'PLACED'
             ELSE order_status
           END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return res.json({ success: true, data: normalizeOrderRow(updated.rows[0]) });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

    const normalized = String(status || '').toUpperCase();
    if (!allowed.includes(normalized)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const current = await pool.query('SELECT order_status FROM orders WHERE id = $1', [id]);
    if (current.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const currentStatus = current.rows[0].order_status;
    const validTransitions = {
      PLACED: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus]?.includes(normalized) && currentStatus !== normalized) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    const result = await pool.query(
      'UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [normalized, id]
    );

    return res.json({ success: true, data: normalizeOrderRow(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  payForOrder,
  updateOrderStatus,
};

const { pool } = require('../config/db');
const { generateDailyToken } = require('./tokenService');

const GST_RATE = Number(process.env.GST_RATE || 0.05);

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const gst = Number((subtotal * GST_RATE).toFixed(2));
  const total = Number((subtotal + gst).toFixed(2));

  return { subtotal, gst, total };
}

async function createOrderFromCart(userId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('At least one item is required');
    error.statusCode = 400;
    throw error;
  }

  const itemIds = items.map((item) => Number(item.menuItemId));

  const menuResult = await pool.query(
    `SELECT id, name, price, is_available
     FROM menu_items
     WHERE id = ANY($1)`,
    [itemIds]
  );

  const menuMap = new Map(menuResult.rows.map((row) => [row.id, row]));

  if (menuResult.rowCount !== itemIds.length) {
    const error = new Error('One or more menu items could not be found');
    error.statusCode = 404;
    throw error;
  }

  const invalidItem = items.find((item) => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0 || Number(item.quantity) > 999);
  if (invalidItem) {
    const error = new Error('Each item quantity must be a whole number between 1 and 999');
    error.statusCode = 400;
    throw error;
  }

  const unavailableItem = items.find((item) => {
    const dbItem = menuMap.get(Number(item.menuItemId));
    return !dbItem || !dbItem.is_available;
  });

  if (unavailableItem) {
    const error = new Error('One or more selected menu items are unavailable');
    error.statusCode = 400;
    throw error;
  }

  const enrichedItems = items.map((item) => {
    const dbItem = menuMap.get(Number(item.menuItemId));
    return {
      menuItemId: Number(item.menuItemId),
      quantity: Number(item.quantity),
      name: dbItem.name,
      price: Number(dbItem.price),
    };
  });

  const { subtotal, gst, total } = calculateTotals(enrichedItems);
  const tokenNumber = await generateDailyToken(process.env.TOKEN_PREFIX || 'A');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (token_number, user_id, subtotal, gst, total_amount, payment_status, order_status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', 'PLACED')
       RETURNING *`,
      [tokenNumber, userId || null, subtotal, gst, total]
    );

    const order = orderResult.rows[0];

    for (const item of enrichedItems) {
      const lineSubtotal = Number((item.price * item.quantity).toFixed(2));
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menuItemId, item.quantity, item.price, lineSubtotal]
      );
    }

    await client.query('COMMIT');
    return { order, items: enrichedItems, totals: { subtotal, gst, total } };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createOrderFromCart,
  calculateTotals,
};

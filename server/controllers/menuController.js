const { pool } = require('../config/db');

async function getMenu(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, category, image, is_available
       FROM menu_items
       ORDER BY category, id`
    );

    return res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getMenuById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, description, price, category, image, is_available
       FROM menu_items WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function createMenuItem(req, res, next) {
  try {
    const { name, description, price, category, image, isAvailable = true } = req.body || {};

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ success: false, message: 'Name, category and price are required' });
    }
    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be positive' });
    }

    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image, is_available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [String(name).trim(), description || '', Number(price), String(category).trim(), image || '', Boolean(isAvailable)]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateMenuItem(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, isAvailable } = req.body || {};

    const existing = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const current = existing.rows[0];
    const updated = {
      name: name !== undefined ? String(name).trim() : current.name,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? Number(price) : Number(current.price),
      category: category !== undefined ? String(category).trim() : current.category,
      image: image !== undefined ? image : current.image,
      is_available: isAvailable !== undefined ? Boolean(isAvailable) : current.is_available,
    };

    if (!updated.name || !updated.category || updated.price <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid menu item details' });
    }

    const result = await pool.query(
      `UPDATE menu_items
       SET name = $1, description = $2, price = $3, category = $4, image = $5, is_available = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [updated.name, updated.description, updated.price, updated.category, updated.image, updated.is_available, id]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteMenuItem(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    next(err);
  }
}

async function patchAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body || {};

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isAvailable must be a boolean' });
    }

    const result = await pool.query(
      `UPDATE menu_items SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isAvailable, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMenu,
  getMenuById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  patchAvailability,
};

const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

async function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
  }

  try {
    const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
    }

    req.user.role = 'admin';
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authorization failed' });
  }
}

module.exports = {
  authenticate,
  authorizeAdmin,
};

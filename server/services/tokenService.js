const { pool } = require('../config/db');

async function generateDailyToken(prefix = 'A') {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const result = await pool.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(token_number FROM '[0-9]+$') AS INTEGER)), 0) + 1 AS next_number
     FROM orders
     WHERE token_number LIKE $1
       AND created_at >= $2
       AND created_at < $3`,
    [`${prefix}%`, startOfDay, endOfDay]
  );

  const nextNumber = Number(result.rows[0].next_number) || 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

module.exports = {
  generateDailyToken,
};

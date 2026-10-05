const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { isValidEmail, isValidPassword } = require('../utils/validation');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password, studentId } = req.body || {};

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({ success: false, message: 'Name, email, password and student ID are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const studentIdTrimmed = studentId.trim();
    const duplicateStudentId = await pool.query('SELECT id FROM users WHERE student_id = $1', [studentIdTrimmed]);
    if (duplicateStudentId.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'Student ID already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, 'student', $4)
       RETURNING id, name, email, role, student_id, created_at`,
      [name.trim(), normalizedEmail, passwordHash, studentIdTrimmed]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      data: { token, user: { ...user, password_hash: undefined } },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      created_at: user.created_at,
    };

    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  const userId = req.user.id;
  const result = await pool.query(
    'SELECT id, name, email, role, student_id, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({ success: true, data: result.rows[0] });
}

async function logout(req, res) {
  return res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = {
  register,
  login,
  me,
  logout,
};

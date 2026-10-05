const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
  try {
    const timestamp = await testConnection();
    res.json({
      success: true,
      message: 'Smart Canteen API is running',
      databaseTime: timestamp.now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const frontendDir = path.resolve(__dirname, '../canteenapp');
app.use(express.static(frontendDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Smart Canteen server running on http://localhost:${PORT}`);
  try {
    await testConnection();
    console.log('Database connection verified.');
  } catch (err) {
    console.error('Database connection check failed:', err.message);
  }
});

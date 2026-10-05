const express = require('express');
const { createOrder, getOrders, getOrderById, payForOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/pay', payForOrder);

module.exports = router;

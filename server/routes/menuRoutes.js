const express = require('express');
const { getMenu, getMenuById, createMenuItem, updateMenuItem, deleteMenuItem, patchAvailability } = require('../controllers/menuController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMenu);
router.get('/:id', getMenuById);

router.post('/', authenticate, authorizeAdmin, createMenuItem);
router.put('/:id', authenticate, authorizeAdmin, updateMenuItem);
router.delete('/:id', authenticate, authorizeAdmin, deleteMenuItem);
router.patch('/:id/availability', authenticate, authorizeAdmin, patchAvailability);

module.exports = router;

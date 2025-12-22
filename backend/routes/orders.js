const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');

// Public routes (for customers)
router.post('/', orderController.createOrder);
router.get('/verify-table/:tableNumber', orderController.verifyTable);
router.get('/table/:tableNumber', orderController.getTableOrders);

// Protected routes (admin only)
router.use(protect, adminOnly);

router.get('/', orderController.getAllOrders);
router.get('/today', orderController.getTodaysOrders);
router.get('/pending', orderController.getPendingOrders);
router.get('/completed', orderController.getCompletedOrders);
router.get('/history', orderController.getHistoryOrders);
router.get('/stats', orderController.getTodaysStats);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/complete', orderController.markAsCompleted);
router.patch('/:id/paid', orderController.markAsPaid);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;

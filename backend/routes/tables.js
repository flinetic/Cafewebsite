const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');

// All routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

// Bulk operations (must be before :id routes)
router.post('/bulk', tableController.createBulkTables);
router.patch('/activate-all', tableController.activateAll);
router.patch('/deactivate-all', tableController.deactivateAll);
router.delete('/delete-all', tableController.deleteAll);

// Table CRUD routes
router.post('/', tableController.createTable);
router.get('/', tableController.getAllTables);
router.get('/:id', tableController.getTableById);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

// Table-specific actions
router.get('/number/:tableNumber', tableController.getTableByNumber);
router.post('/:id/regenerate-qr', tableController.regenerateQR);
router.patch('/:id/toggle', tableController.toggleActive);

// QR code download routes
router.get('/:id/qr/png', tableController.getQRPng);
router.get('/:id/qr/svg', tableController.getQRSvg);

module.exports = router;


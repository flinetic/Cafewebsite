const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');

// ==================== Public Routes ====================
// These routes are accessible to all customers

// Get available menu items
router.get('/', menuController.getAvailableItems);

// Get menu grouped by category
router.get('/grouped', menuController.getMenuGrouped);

// Get categories with counts
router.get('/categories', menuController.getCategories);

// Search menu items
router.get('/search', menuController.searchItems);

// Get items by category
router.get('/category/:category', menuController.getItemsByCategory);

// Get single item by ID
router.get('/:id', menuController.getItemById);

// ==================== Admin Routes ====================
// These routes require authentication and admin role

// Get all items (including unavailable) - Admin only
router.get('/admin/all', protect, adminOnly, menuController.getAllItems);

// Create new item - Admin only
router.post('/', protect, adminOnly, menuController.createItem);

// Update item - Admin only
router.put('/:id', protect, adminOnly, menuController.updateItem);

// Delete item - Admin only
router.delete('/:id', protect, adminOnly, menuController.deleteItem);

// Toggle availability - Admin only
router.patch('/:id/toggle', protect, adminOnly, menuController.toggleAvailability);

// Update sort order - Admin only
router.put('/sort-order', protect, adminOnly, menuController.updateSortOrder);

module.exports = router;

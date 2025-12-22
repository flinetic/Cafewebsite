const menuService = require('../services/menuService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Menu Controller - HTTP handlers for menu operations
 */

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createItem = asyncHandler(async (req, res) => {
    const item = await menuService.createItem(req.body);

    res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: item
    });
});

// @desc    Get all menu items (admin - includes unavailable)
// @route   GET /api/menu/admin
// @access  Private/Admin
exports.getAllItems = asyncHandler(async (req, res) => {
    const items = await menuService.getAllItems();

    res.json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get available menu items (public)
// @route   GET /api/menu
// @access  Public
exports.getAvailableItems = asyncHandler(async (req, res) => {
    const items = await menuService.getAvailableItems();

    res.json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get menu grouped by category (public)
// @route   GET /api/menu/grouped
// @access  Public
exports.getMenuGrouped = asyncHandler(async (req, res) => {
    const grouped = await menuService.getMenuGroupedByCategory();

    res.json({
        success: true,
        data: grouped
    });
});

// @desc    Get items by category (public)
// @route   GET /api/menu/category/:category
// @access  Public
exports.getItemsByCategory = asyncHandler(async (req, res) => {
    const items = await menuService.getItemsByCategory(req.params.category);

    res.json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get categories with counts (public)
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await menuService.getCategoriesWithCounts();

    res.json({
        success: true,
        data: categories
    });
});

// @desc    Search menu items (public)
// @route   GET /api/menu/search
// @access  Public
exports.searchItems = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required'
        });
    }

    const items = await menuService.searchItems(q);

    res.json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getItemById = asyncHandler(async (req, res) => {
    const item = await menuService.getItemById(req.params.id);

    res.json({
        success: true,
        data: item
    });
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateItem = asyncHandler(async (req, res) => {
    const item = await menuService.updateItem(req.params.id, req.body);

    res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: item
    });
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteItem = asyncHandler(async (req, res) => {
    await menuService.deleteItem(req.params.id);

    res.json({
        success: true,
        message: 'Menu item deleted successfully'
    });
});

// @desc    Toggle item availability
// @route   PATCH /api/menu/:id/toggle
// @access  Private/Admin
exports.toggleAvailability = asyncHandler(async (req, res) => {
    const item = await menuService.toggleAvailability(req.params.id);

    res.json({
        success: true,
        message: `Item ${item.isAvailable ? 'is now available' : 'is now unavailable'}`,
        data: item
    });
});

// @desc    Update sort order for multiple items
// @route   PUT /api/menu/sort-order
// @access  Private/Admin
exports.updateSortOrder = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: 'Items array is required'
        });
    }

    await menuService.updateSortOrder(items);

    res.json({
        success: true,
        message: 'Sort order updated successfully'
    });
});

// @desc    Upload menu item image
// @route   POST /api/menu/upload-image
// @access  Private/Admin
exports.uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image file provided'
        });
    }

    res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
            url: req.file.path // Cloudinary returns the URL in path
        }
    });
});


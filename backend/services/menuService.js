const MenuItem = require('../models/MenuItem');

/**
 * Menu Service - Business logic for menu operations
 */
class MenuService {
    /**
     * Create a new menu item
     */
    async createItem(itemData) {
        const item = await MenuItem.create(itemData);
        return item;
    }

    /**
     * Get all menu items (admin view - includes unavailable)
     */
    async getAllItems() {
        return MenuItem.find().sort({ category: 1, sortOrder: 1, name: 1 });
    }

    /**
     * Get available menu items (customer view)
     */
    async getAvailableItems() {
        return MenuItem.getAvailableMenu();
    }

    /**
     * Get menu items by category
     */
    async getItemsByCategory(category) {
        return MenuItem.getByCategory(category);
    }

    /**
     * Get single menu item by ID
     */
    async getItemById(id) {
        const item = await MenuItem.findById(id);
        if (!item) {
            throw new Error('Menu item not found');
        }
        return item;
    }

    /**
     * Update menu item
     */
    async updateItem(id, updateData) {
        const item = await MenuItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!item) {
            throw new Error('Menu item not found');
        }
        return item;
    }

    /**
     * Delete menu item
     */
    async deleteItem(id) {
        const item = await MenuItem.findByIdAndDelete(id);
        if (!item) {
            throw new Error('Menu item not found');
        }
        return item;
    }

    /**
     * Toggle item availability
     */
    async toggleAvailability(id) {
        const item = await MenuItem.findById(id);
        if (!item) {
            throw new Error('Menu item not found');
        }
        item.isAvailable = !item.isAvailable;
        await item.save();
        return item;
    }

    /**
     * Get menu grouped by categories
     */
    async getMenuGroupedByCategory() {
        const items = await MenuItem.find({ isAvailable: true })
            .sort({ sortOrder: 1, name: 1 });
        
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        return grouped;
    }

    /**
     * Search menu items
     */
    async searchItems(query) {
        return MenuItem.find({
            $text: { $search: query },
            isAvailable: true
        }).sort({ score: { $meta: 'textScore' } });
    }

    /**
     * Get all categories with item counts
     */
    async getCategoriesWithCounts() {
        const result = await MenuItem.aggregate([
            { $match: { isAvailable: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        return result.map(r => ({ category: r._id, count: r.count }));
    }

    /**
     * Bulk update sort order
     */
    async updateSortOrder(items) {
        const bulkOps = items.map(item => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { sortOrder: item.sortOrder } }
            }
        }));
        await MenuItem.bulkWrite(bulkOps);
        return true;
    }
}

module.exports = new MenuService();

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

    /**
     * Bulk import menu items from JSON
     */
    async bulkImport(items) {
        const validItems = items.map(item => ({
            name: item.name,
            description: item.description || '',
            price: Number(item.price) || 0,
            category: item.category || 'main-course',
            image: item.image || null,
            isAvailable: item.isAvailable !== false,
            isVegetarian: Boolean(item.isVegetarian),
            isVegan: Boolean(item.isVegan),
            isSpicy: Boolean(item.isSpicy),
            preparationTime: Number(item.preparationTime) || 15,
            tags: Array.isArray(item.tags) ? item.tags : [],
            sortOrder: Number(item.sortOrder) || 0
        }));

        const result = await MenuItem.insertMany(validItems, { ordered: false });
        return {
            created: result.length,
            items: result
        };
    }
}

module.exports = new MenuService();

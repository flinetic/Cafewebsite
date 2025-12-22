const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: {
            values: ['appetizers', 'main-course', 'desserts', 'beverages', 'snacks', 'specials'],
            message: '{VALUE} is not a valid category'
        }
    },
    image: {
        type: String,
        default: null
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    preparationTime: {
        type: Number, // in minutes
        default: 15
    },
    tags: [{
        type: String,
        trim: true
    }],
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for faster queries
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

// Transform for JSON output
menuItemSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

// Static method to get menu by category
menuItemSchema.statics.getByCategory = async function(category) {
    return this.find({ category, isAvailable: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to get all available items
menuItemSchema.statics.getAvailableMenu = async function() {
    return this.find({ isAvailable: true }).sort({ category: 1, sortOrder: 1, name: 1 });
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;

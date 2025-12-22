const mongoose = require('mongoose');

const cafeConfigSchema = new mongoose.Schema({
    cafeName: {
        type: String,
        required: [true, 'Café name is required'],
        trim: true,
        default: 'BookAVibe Café'
    },
    tagline: {
        type: String,
        trim: true,
        default: 'Where Every Sip Tells a Story'
    },
    logoUrl: {
        type: String,
        default: '/assets/logo.png'
    },
    location: {
        latitude: {
            type: Number,
            required: [true, 'Latitude is required'],
            min: -90,
            max: 90,
            default: 28.6139  // Default: New Delhi
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required'],
            min: -180,
            max: 180,
            default: 77.2090  // Default: New Delhi
        },
        address: {
            type: String,
            trim: true,
            default: ''
        }
    },
    allowedRadiusMeters: {
        type: Number,
        min: [10, 'Radius must be at least 10 meters'],
        max: [5000, 'Radius cannot exceed 5000 meters'],
        default: 50
    },
    // Maximum number of admin accounts allowed
    maxAdminLimit: {
        type: Number,
        min: [1, 'At least 1 admin is required'],
        max: [10, 'Cannot have more than 10 admins'],
        default: 1
    },
    menuBaseUrl: {
        type: String,
        required: true,
        default: process.env.MENU_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
    },
    currency: {
        type: String,
        default: '₹'
    },
    contactPhone: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    socialLinks: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },
    operatingHours: {
        monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
    },
    theme: {
        primaryColor: { type: String, default: '#d97706' },    // Amber-600
        secondaryColor: { type: String, default: '#ea580c' },  // Orange-600
        accentColor: { type: String, default: '#f59e0b' },     // Amber-500
        backgroundColor: { type: String, default: '#fffbeb' }  // Amber-50
    }
}, {
    timestamps: true
});

// Only allow one config document
cafeConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

// Transform for JSON output
cafeConfigSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const CafeConfig = mongoose.model('CafeConfig', cafeConfigSchema);

module.exports = CafeConfig;

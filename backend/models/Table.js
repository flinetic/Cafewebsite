const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        unique: true,
        min: [1, 'Table number must be at least 1']
    },
    qrCodeSvg: {
        type: String,
        default: null
    },
    qrCodePng: {
        type: Buffer,
        default: null
    },
    qrCodeDataUrl: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for checking if QR is generated
tableSchema.virtual('hasQR').get(function () {
    return !!(this.qrCodeSvg || this.qrCodePng);
});

// Transform for JSON output
tableSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Don't send raw buffer in JSON, use dataUrl instead
        delete ret.qrCodePng;
        return ret;
    }
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;

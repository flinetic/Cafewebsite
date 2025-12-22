const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat', 'bogo'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minimumOrder: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    code: {
        type: String,
        uppercase: true,
        trim: true,
        sparse: true
    },
    image: {
        type: String,
        default: null
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTo: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    applicableCategories: [{
        type: String
    }],
    applicableItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    }]
}, {
    timestamps: true
});

// Virtual for checking if offer is valid
offerSchema.virtual('isValid').get(function () {
    const now = new Date();
    return this.isActive &&
        now >= this.validFrom &&
        now <= this.validTo &&
        (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Transform for JSON
offerSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Offer', offerSchema);

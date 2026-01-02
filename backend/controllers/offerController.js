const asyncHandler = require('../middleware/asyncHandler');
const Offer = require('../models/Offer');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Create a new offer
 * @route   POST /api/offers
 * @access  Private/Admin
 */
const createOffer = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        discountType,
        discountValue,
        minimumOrder,
        maxDiscount,
        code,
        image,
        validFrom,
        validTo,
        isActive,
        usageLimit,
        applicableCategories,
        applicableItems
    } = req.body;

    if (!title || !discountValue || !validTo) {
        return errorResponse(res, 400, 'Please provide title, discount value, and validity date');
    }

    const offer = await Offer.create({
        title,
        description,
        discountType,
        discountValue,
        minimumOrder,
        maxDiscount,
        code,
        image,
        validFrom,
        validTo,
        isActive,
        usageLimit,
        applicableCategories,
        applicableItems
    });

    successResponse(res, 201, 'Offer created successfully', offer);
});

/**
 * @desc    Get all offers
 * @route   GET /api/offers
 * @access  Public
 */
const getAllOffers = asyncHandler(async (req, res) => {
    const { active } = req.query;

    let query = {};

    if (active === 'true') {
        const now = new Date();
        query = {
            isActive: true,
            validFrom: { $lte: now },
            validTo: { $gte: now }
        };
    }

    const offers = await Offer.find(query).sort({ createdAt: -1 });
    successResponse(res, 200, 'Offers retrieved', offers);
});

/**
 * @desc    Get active offers (public)
 * @route   GET /api/offers/active
 * @access  Public
 */
const getActiveOffers = asyncHandler(async (req, res) => {
    const now = new Date();

    const offers = await Offer.find({
        isActive: true,
        validFrom: { $lte: now },
        validTo: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
    }).sort({ createdAt: -1 });

    successResponse(res, 200, 'Active offers retrieved', offers);
});

/**
 * @desc    Get upcoming offers (public)
 * @route   GET /api/offers/upcoming
 * @access  Public
 */
const getUpcomingOffers = asyncHandler(async (req, res) => {
    const now = new Date();

    const offers = await Offer.find({
        isActive: true,
        validFrom: { $gt: now }, // Start date is in the future
        validTo: { $gte: now }   // End date hasn't passed
    }).sort({ validFrom: 1 }); // Sort by upcoming date, nearest first

    successResponse(res, 200, 'Upcoming offers retrieved', offers);
});

/**
 * @desc    Get single offer
 * @route   GET /api/offers/:id
 * @access  Public
 */
const getOfferById = asyncHandler(async (req, res) => {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
        return errorResponse(res, 404, 'Offer not found');
    }

    successResponse(res, 200, 'Offer retrieved', offer);
});

/**
 * @desc    Update offer
 * @route   PUT /api/offers/:id
 * @access  Private/Admin
 */
const updateOffer = asyncHandler(async (req, res) => {
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
        return errorResponse(res, 404, 'Offer not found');
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    successResponse(res, 200, 'Offer updated successfully', offer);
});

/**
 * @desc    Toggle offer active status
 * @route   PATCH /api/offers/:id/toggle
 * @access  Private/Admin
 */
const toggleOfferStatus = asyncHandler(async (req, res) => {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
        return errorResponse(res, 404, 'Offer not found');
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    successResponse(res, 200, `Offer ${offer.isActive ? 'activated' : 'deactivated'}`, offer);
});

/**
 * @desc    Delete offer
 * @route   DELETE /api/offers/:id
 * @access  Private/Admin
 */
const deleteOffer = asyncHandler(async (req, res) => {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
        return errorResponse(res, 404, 'Offer not found');
    }

    await Offer.findByIdAndDelete(req.params.id);
    successResponse(res, 200, 'Offer deleted successfully', null);
});

module.exports = {
    createOffer,
    getAllOffers,
    getActiveOffers,
    getUpcomingOffers,
    getOfferById,
    updateOffer,
    toggleOfferStatus,
    deleteOffer
};

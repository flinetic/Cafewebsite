const configService = require('../services/configService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Config Controller - HTTP handlers for café configuration
 */

// @desc    Get café configuration
// @route   GET /api/config
// @access  Private/Admin
exports.getConfig = asyncHandler(async (req, res) => {
    const config = await configService.getConfig();

    res.json({
        success: true,
        data: config
    });
});

// @desc    Get public configuration (for customer-facing pages)
// @route   GET /api/config/public
// @access  Public
exports.getPublicConfig = asyncHandler(async (req, res) => {
    const config = await configService.getPublicConfig();

    res.json({
        success: true,
        data: config
    });
});

// @desc    Update café configuration
// @route   PUT /api/config
// @access  Private/Admin
exports.updateConfig = asyncHandler(async (req, res) => {
    const config = await configService.updateConfig(req.body);

    res.json({
        success: true,
        message: 'Configuration updated successfully',
        data: config
    });
});

// @desc    Update location settings
// @route   PUT /api/config/location
// @access  Private/Admin
exports.updateLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude, address } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Latitude and longitude are required'
        });
    }

    const config = await configService.updateLocation(latitude, longitude, address);

    res.json({
        success: true,
        message: 'Location updated successfully',
        data: config
    });
});

// @desc    Update allowed radius
// @route   PUT /api/config/radius
// @access  Private/Admin
exports.updateRadius = asyncHandler(async (req, res) => {
    const { radius } = req.body;

    if (!radius || radius < 10 || radius > 5000) {
        return res.status(400).json({
            success: false,
            message: 'Radius must be between 10 and 5000 meters'
        });
    }

    const config = await configService.updateRadius(radius);

    res.json({
        success: true,
        message: 'Allowed radius updated successfully',
        data: config
    });
});

// @desc    Update theme settings
// @route   PUT /api/config/theme
// @access  Private/Admin
exports.updateTheme = asyncHandler(async (req, res) => {
    const config = await configService.updateTheme(req.body);

    res.json({
        success: true,
        message: 'Theme updated successfully',
        data: config
    });
});

// @desc    Update operating hours
// @route   PUT /api/config/hours
// @access  Private/Admin
exports.updateOperatingHours = asyncHandler(async (req, res) => {
    const config = await configService.updateOperatingHours(req.body);

    res.json({
        success: true,
        message: 'Operating hours updated successfully',
        data: config
    });
});

// @desc    Update admin limit
// @route   PUT /api/config/admin-limit
// @access  Private/Admin
exports.updateAdminLimit = asyncHandler(async (req, res) => {
    const { maxAdminLimit } = req.body;

    if (!maxAdminLimit || maxAdminLimit < 1 || maxAdminLimit > 10) {
        return res.status(400).json({
            success: false,
            message: 'Admin limit must be between 1 and 10'
        });
    }

    const config = await configService.updateConfig({ maxAdminLimit });

    res.json({
        success: true,
        message: 'Admin limit updated successfully',
        data: config
    });
});

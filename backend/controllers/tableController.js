const tableService = require('../services/tableService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Table Controller - HTTP handlers for table operations
 */

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = asyncHandler(async (req, res) => {
    const { tableNumber } = req.body;

    if (!tableNumber || tableNumber < 1) {
        return res.status(400).json({
            success: false,
            message: 'Valid table number is required'
        });
    }

    const table = await tableService.createTable(parseInt(tableNumber));

    res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: table
    });
});

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private/Admin
exports.getAllTables = asyncHandler(async (req, res) => {
    const tables = await tableService.getAllTables();

    res.json({
        success: true,
        count: tables.length,
        data: tables
    });
});

// @desc    Get table by ID
// @route   GET /api/tables/:id
// @access  Private/Admin
exports.getTableById = asyncHandler(async (req, res) => {
    const table = await tableService.getTableById(req.params.id);

    res.json({
        success: true,
        data: table
    });
});

// @desc    Get table by table number
// @route   GET /api/tables/number/:tableNumber
// @access  Private/Admin
exports.getTableByNumber = asyncHandler(async (req, res) => {
    const table = await tableService.getTableByNumber(parseInt(req.params.tableNumber));

    res.json({
        success: true,
        data: table
    });
});

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin
exports.updateTable = asyncHandler(async (req, res) => {
    const table = await tableService.updateTable(req.params.id, req.body);

    res.json({
        success: true,
        message: 'Table updated successfully',
        data: table
    });
});

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = asyncHandler(async (req, res) => {
    await tableService.deleteTable(req.params.id);

    res.json({
        success: true,
        message: 'Table deleted successfully'
    });
});

// @desc    Regenerate QR code for table
// @route   POST /api/tables/:id/regenerate-qr
// @access  Private/Admin
exports.regenerateQR = asyncHandler(async (req, res) => {
    const table = await tableService.regenerateQR(req.params.id);

    res.json({
        success: true,
        message: 'QR code regenerated successfully',
        data: table
    });
});

// @desc    Get QR code as PNG
// @route   GET /api/tables/:id/qr/png
// @access  Private/Admin
exports.getQRPng = asyncHandler(async (req, res) => {
    const pngBuffer = await tableService.getQRPng(req.params.id);

    res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename=table-qr-${req.params.id}.png`
    });
    res.send(pngBuffer);
});

// @desc    Get QR code as SVG
// @route   GET /api/tables/:id/qr/svg
// @access  Private/Admin
exports.getQRSvg = asyncHandler(async (req, res) => {
    const svg = await tableService.getQRSvg(req.params.id);

    res.set({
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename=table-qr-${req.params.id}.svg`
    });
    res.send(svg);
});

// @desc    Toggle table active status
// @route   PATCH /api/tables/:id/toggle
// @access  Private/Admin
exports.toggleActive = asyncHandler(async (req, res) => {
    const table = await tableService.toggleActive(req.params.id);

    res.json({
        success: true,
        message: `Table ${table.isActive ? 'activated' : 'deactivated'} successfully`,
        data: table
    });
});

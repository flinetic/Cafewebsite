const asyncHandler = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Create a new order (public - for customers)
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = asyncHandler(async (req, res) => {
  const { tableNumber, customerName, customerPhone, items, notes } = req.body;
  
  if (!tableNumber || !customerName || !customerPhone || !items || items.length === 0) {
    return errorResponse(res, 400, 'Please provide all required fields');
  }
  
  // Validate phone number format (basic validation)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(customerPhone.replace(/\D/g, ''))) {
    return errorResponse(res, 400, 'Please provide a valid 10-digit phone number');
  }
  
  const order = await orderService.createOrder({
    tableNumber,
    customerName,
    customerPhone: customerPhone.replace(/\D/g, ''),
    items,
    notes
  });
  
  successResponse(res, 201, 'Order placed successfully', order);
});

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, tableNumber, startDate, endDate } = req.query;
  
  const orders = await orderService.getAllOrders({
    status,
    tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
    startDate,
    endDate
  });
  
  successResponse(res, 200, 'Orders retrieved', orders);
});

/**
 * @desc    Get today's orders by status
 * @route   GET /api/orders/today
 * @access  Private/Admin
 */
const getTodaysOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const orders = await orderService.getTodaysOrdersByStatus(status);
  
  successResponse(res, 200, 'Orders retrieved', orders);
});

/**
 * @desc    Get pending orders
 * @route   GET /api/orders/pending
 * @access  Private/Admin
 */
const getPendingOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getTodaysOrdersByStatus('pending');
  successResponse(res, 200, 'Pending orders retrieved', orders);
});

/**
 * @desc    Get completed orders
 * @route   GET /api/orders/completed
 * @access  Private/Admin
 */
const getCompletedOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getTodaysOrdersByStatus('completed');
  successResponse(res, 200, 'Completed orders retrieved', orders);
});

/**
 * @desc    Get history orders for a specific date
 * @route   GET /api/orders/history
 * @access  Private/Admin
 */
const getHistoryOrders = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  // Default to today if no date provided
  const queryDate = date ? new Date(date) : new Date();
  
  const result = await orderService.getOrdersByDate(queryDate);
  
  successResponse(res, 200, 'History retrieved', result);
});

/**
 * @desc    Get today's statistics
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
const getTodaysStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getTodaysStats();
  successResponse(res, 200, 'Stats retrieved', stats);
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private/Admin
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  successResponse(res, 200, 'Order retrieved', order);
});

/**
 * @desc    Mark order as completed
 * @route   PATCH /api/orders/:id/complete
 * @access  Private/Admin
 */
const markAsCompleted = asyncHandler(async (req, res) => {
  const order = await orderService.markAsCompleted(req.params.id);
  successResponse(res, 200, 'Order marked as completed', order);
});

/**
 * @desc    Mark order as paid (move to history)
 * @route   PATCH /api/orders/:id/paid
 * @access  Private/Admin
 */
const markAsPaid = asyncHandler(async (req, res) => {
  const order = await orderService.markAsPaid(req.params.id);
  successResponse(res, 200, 'Order marked as paid', order);
});

/**
 * @desc    Cancel order
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
const cancelOrder = asyncHandler(async (req, res) => {
  await orderService.cancelOrder(req.params.id);
  successResponse(res, 200, 'Order cancelled successfully', null);
});

/**
 * @desc    Get orders for customer at table
 * @route   GET /api/orders/table/:tableNumber
 * @access  Public
 */
const getTableOrders = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { phone } = req.query;
  
  if (!phone) {
    return errorResponse(res, 400, 'Phone number is required');
  }
  
  const orders = await orderService.getOrdersForTable(
    parseInt(tableNumber),
    phone.replace(/\D/g, '')
  );
  
  successResponse(res, 200, 'Orders retrieved', orders);
});

/**
 * @desc    Verify table exists
 * @route   GET /api/orders/verify-table/:tableNumber
 * @access  Public
 */
const verifyTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const Table = require('../models/Table');
  
  const table = await Table.findOne({ 
    tableNumber: parseInt(tableNumber), 
    isActive: true 
  });
  
  if (!table) {
    return errorResponse(res, 404, 'Invalid or inactive table');
  }
  
  successResponse(res, 200, 'Table verified', { 
    tableNumber: table.tableNumber,
    isActive: table.isActive 
  });
});

module.exports = {
  createOrder,
  getAllOrders,
  getTodaysOrders,
  getPendingOrders,
  getCompletedOrders,
  getHistoryOrders,
  getTodaysStats,
  getOrderById,
  markAsCompleted,
  markAsPaid,
  cancelOrder,
  getTableOrders,
  verifyTable
};

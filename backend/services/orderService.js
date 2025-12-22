const Order = require('../models/Order');
const Table = require('../models/Table');

/**
 * Create a new order
 */
const createOrder = async (orderData) => {
  const { tableNumber, customerName, customerPhone, items, notes } = orderData;
  
  // Verify table exists and is active
  const table = await Table.findOne({ tableNumber, isActive: true });
  if (!table) {
    throw new Error('Invalid or inactive table');
  }
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Generate order number
  const orderNumber = await Order.generateOrderNumber();
  
  const order = new Order({
    orderNumber,
    tableNumber,
    customerName,
    customerPhone,
    items,
    totalAmount,
    notes,
    status: 'pending'
  });
  
  await order.save();
  return order;
};

/**
 * Get all orders with optional filters
 */
const getAllOrders = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.tableNumber) {
    query.tableNumber = filters.tableNumber;
  }
  
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return Order.find(query).sort({ createdAt: -1 });
};

/**
 * Get orders by status
 */
const getOrdersByStatus = async (status) => {
  return Order.find({ status }).sort({ createdAt: -1 });
};

/**
 * Get today's orders by status
 */
const getTodaysOrdersByStatus = async (status) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const query = {
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  };
  
  if (status) {
    query.status = status;
  }
  
  return Order.find(query).sort({ createdAt: -1 });
};

/**
 * Get order by ID
 */
const getOrderById = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

/**
 * Get order by order number
 */
const getOrderByNumber = async (orderNumber) => {
  const order = await Order.findOne({ orderNumber });
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

/**
 * Update order status to completed
 */
const markAsCompleted = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.status !== 'pending') {
    throw new Error('Only pending orders can be marked as completed');
  }
  
  order.status = 'completed';
  order.completedAt = new Date();
  await order.save();
  
  return order;
};

/**
 * Update order status to history (paid)
 */
const markAsPaid = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.status !== 'completed') {
    throw new Error('Only completed orders can be marked as paid');
  }
  
  order.status = 'history';
  order.paidAt = new Date();
  await order.save();
  
  return order;
};

/**
 * Cancel/delete order (only pending orders)
 */
const cancelOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.status !== 'pending') {
    throw new Error('Only pending orders can be cancelled');
  }
  
  await Order.findByIdAndDelete(id);
  return { message: 'Order cancelled successfully' };
};

/**
 * Get today's statistics
 */
const getTodaysStats = async () => {
  return Order.getTodaysStats();
};

/**
 * Get orders by date for history
 */
const getOrdersByDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const orders = await Order.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: 'history'
  }).sort({ createdAt: -1 });
  
  // Calculate total for the day
  const totalForDay = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  return {
    orders,
    totalOrders: orders.length,
    totalEarnings: totalForDay
  };
};

/**
 * Get orders for table (for customer view)
 */
const getOrdersForTable = async (tableNumber, customerPhone) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  
  return Order.find({
    tableNumber,
    customerPhone,
    createdAt: { $gte: startOfDay },
    status: { $in: ['pending', 'completed'] }
  }).sort({ createdAt: -1 });
};

/**
 * Cleanup old orders
 */
const cleanupOldOrders = async (daysToKeep = 30) => {
  return Order.cleanupOldOrders(daysToKeep);
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByStatus,
  getTodaysOrdersByStatus,
  getOrderById,
  getOrderByNumber,
  markAsCompleted,
  markAsPaid,
  cancelOrder,
  getTodaysStats,
  getOrdersByDate,
  getOrdersForTable,
  cleanupOldOrders
};

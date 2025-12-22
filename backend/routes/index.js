/**
 * API Routes Index
 * Central routing configuration
 * @module routes/index
 */

const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth");
const staffRoutes = require("./staff");
const tableRoutes = require("./tables");
const configRoutes = require("./config");
const menuRoutes = require("./menu");
const orderRoutes = require("./orders");

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "BookAVibe API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API version and info
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to BookAVibe Cafe Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      staff: "/api/staff",
      tables: "/api/tables",
      config: "/api/config",
      menu: "/api/menu",
      orders: "/api/orders",
      health: "/api/health",
    },
    documentation: "/api/docs",
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/staff", staffRoutes);
router.use("/tables", tableRoutes);
router.use("/config", configRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);

module.exports = router;

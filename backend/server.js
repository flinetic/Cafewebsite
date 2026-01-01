/**
 * BookAVibe Cafe Management System
 * Main Server Entry Point
 * @module server
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const path = require("path");

// Database connection
const connectDB = require("./config/db");

// Routes
const routes = require("./routes");

// Middleware
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Initialize Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Connect to Database
connectDB();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.MENU_BASE_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://192.168.0.104:5173",
      "http://192.168.0.104:3000",
      "https://cafewebsite-cyan.vercel.app",
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ["role", "department", "shift", "isActive"], // Allow duplicate params for filtering
  })
);

// ==========================================
// GENERAL MIDDLEWARE
// ==========================================

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Production logging (minimal)
  app.use(morgan("combined"));
}

// Static files (for uploaded files if using local storage)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// RATE LIMITING
// ==========================================

// Apply rate limiting to API routes
app.use("/api", apiLimiter);

// ==========================================
// ROUTES
// ==========================================

// API routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "☕ Welcome to BookAVibe Cafe Management API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      api: "/api",
      health: "/api/health",
      auth: "/api/auth",
      staff: "/api/staff",
    },
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ==========================================
// SERVER STARTUP
// ==========================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n========================================");
  console.log("☕ BookAVibe Cafe Management System");
  console.log("========================================");
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🚀 Server running on port ${PORT}`);
  // console.log(`🔗 API URL: http://192.168.0.104:${PORT}/api`);
  // console.log(`💚 Health Check: http://192.168.0.104:${PORT}/api/health`);
  console.log("========================================\n");
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Rejection:", err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});

// Graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\nSIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});

module.exports = app;

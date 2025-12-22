/**
 * Authentication Routes
 * Handles all authentication related endpoints
 * @module routes/auth
 */

const express = require("express");
const router = express.Router();

// Controllers
const authController = require("../controllers/authController");

// Middleware
const protect = require("../middleware/auth");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimiter");
const {
  validate,
  registerRules,
  loginRules,
  emailRules,
  passwordResetRules,
  passwordUpdateRules,
} = require("../middleware/validators");

/**
 * @route   GET /api/auth/admin-exists
 * @desc    Check if admin exists and if registration as admin is available
 * @access  Public
 */
router.get("/admin-exists", authController.checkAdminExists);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new staff member
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  registerRules,
  validate,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login staff member
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  loginRules,
  validate,
  authController.login
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get("/verify-email/:token", authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  "/resend-verification",
  authLimiter,
  emailRules,
  validate,
  authController.resendVerification
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  "/forgot-password",
  passwordResetLimiter,
  emailRules,
  validate,
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  passwordResetRules,
  validate,
  authController.resetPassword
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token)
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", protect, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get("/me", protect, authController.getMe);

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update password (when logged in)
 * @access  Private
 */
router.put(
  "/update-password",
  protect,
  passwordUpdateRules,
  validate,
  authController.updatePassword
);

module.exports = router;

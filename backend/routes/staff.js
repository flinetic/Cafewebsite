/**
 * Staff Routes
 * Handles all staff profile and management endpoints
 * @module routes/staff
 */

const express = require("express");
const router = express.Router();

// Controllers
const staffController = require("../controllers/staffController");

// Middleware
const protect = require("../middleware/auth");
const { adminOnly, authorize } = require("../middleware/roleAuth");
const { uploadProfileImage, handleUploadError } = require("../middleware/upload");
const { uploadLimiter } = require("../middleware/rateLimiter");
const {
  validate,
  profileUpdateRules,
  staffManagementRules,
  mongoIdRules,
  paginationRules,
  registerRules,
} = require("../middleware/validators");

// All routes require authentication
router.use(protect);

// ==========================================
// PROFILE ROUTES (for authenticated staff)
// ==========================================

/**
 * @route   GET /api/staff/profile
 * @desc    Get current staff profile
 * @access  Private
 */
router.get("/profile", staffController.getProfile);

/**
 * @route   PUT /api/staff/profile
 * @desc    Update current staff profile
 * @access  Private
 */
router.put(
  "/profile",
  profileUpdateRules,
  validate,
  staffController.updateProfile
);

/**
 * @route   PUT /api/staff/profile/image
 * @desc    Update profile image
 * @access  Private
 */
router.put(
  "/profile/image",
  uploadLimiter,
  uploadProfileImage.single("profileImage"),
  handleUploadError,
  staffController.updateProfileImage
);

// ==========================================
// NOTIFICATION ROUTES
// ==========================================

/**
 * @route   GET /api/staff/notifications
 * @desc    Get notifications for current staff
 * @access  Private
 */
router.get("/notifications", staffController.getNotifications);

/**
 * @route   PUT /api/staff/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/notifications/read-all", staffController.markAllNotificationsRead);

/**
 * @route   PUT /api/staff/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put(
  "/notifications/:notificationId/read",
  staffController.markNotificationRead
);

/**
 * @route   DELETE /api/staff/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  "/notifications/:notificationId",
  staffController.deleteNotification
);

/**
 * @route   DELETE /api/staff/notifications
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete("/notifications", staffController.clearAllNotifications);

// ==========================================
// ADMIN ROUTES (for staff management)
// ==========================================

/**
 * @route   GET /api/staff/stats
 * @desc    Get staff statistics
 * @access  Private/Admin
 */
router.get("/stats", adminOnly, staffController.getStaffStats);

/**
 * @route   GET /api/staff
 * @desc    Get all staff members
 * @access  Private/Admin
 */
router.get(
  "/",
  adminOnly,
  paginationRules,
  validate,
  staffController.getAllStaff
);

/**
 * @route   POST /api/staff
 * @desc    Create new staff member
 * @access  Private/Admin
 */
router.post(
  "/",
  adminOnly,
  registerRules,
  validate,
  staffController.createStaff
);

/**
 * @route   GET /api/staff/:id
 * @desc    Get staff member by ID
 * @access  Private/Admin
 */
router.get(
  "/:id",
  adminOnly,
  mongoIdRules,
  validate,
  staffController.getStaffById
);

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff member
 * @access  Private/Admin
 */
router.put(
  "/:id",
  adminOnly,
  mongoIdRules,
  staffManagementRules,
  validate,
  staffController.updateStaff
);

/**
 * @route   PUT /api/staff/:id/role
 * @desc    Update staff role
 * @access  Private/Admin
 */
router.put(
  "/:id/role",
  adminOnly,
  mongoIdRules,
  validate,
  staffController.updateStaffRole
);

/**
 * @route   PUT /api/staff/:id/activate
 * @desc    Activate staff member
 * @access  Private/Admin
 */
router.put(
  "/:id/activate",
  adminOnly,
  mongoIdRules,
  validate,
  staffController.activateStaff
);

/**
 * @route   PUT /api/staff/:id/deactivate
 * @desc    Deactivate staff member
 * @access  Private/Admin
 */
router.put(
  "/:id/deactivate",
  adminOnly,
  mongoIdRules,
  validate,
  staffController.deactivateStaff
);

/**
 * @route   DELETE /api/staff/:id
 * @desc    Delete staff member
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  adminOnly,
  mongoIdRules,
  validate,
  staffController.deleteStaff
);

module.exports = router;

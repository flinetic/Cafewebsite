/**
 * Staff Controller
 * Handles staff profile management, CRUD operations
 * @module controllers/staffController
 */

const Staff = require("../models/Staff");
const CafeConfig = require("../models/CafeConfig");
const asyncHandler = require("../middleware/asyncHandler");
const { sendNotification } = require("../utils/sendNotification");

/**
 * @desc    Get current staff profile
 * @route   GET /api/staff/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.staff.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  res.json({
    success: true,
    data: { staff },
  });
});

/**
 * @desc    Update current staff profile
 * @route   PUT /api/staff/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  // Fields that staff can update themselves
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "dateOfBirth",
    "gender",
    "address",
    "emergencyContact",
    "preferences",
  ];

  // Filter only allowed fields
  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  updates.updatedBy = req.staff.id;

  const staff = await Staff.findByIdAndUpdate(req.staff.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await sendNotification(
    staff._id,
    "Profile Updated",
    "Your profile information has been updated successfully.",
    "success"
  );

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { staff },
  });
});

/**
 * @desc    Update profile image
 * @route   PUT /api/staff/profile/image
 * @access  Private
 */
exports.updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image",
    });
  }

  const staff = await Staff.findByIdAndUpdate(
    req.staff.id,
    {
      profileImage: req.file.path,
      updatedBy: req.staff.id,
    },
    { new: true }
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await sendNotification(
    staff._id,
    "Profile Image Updated",
    "Your profile picture has been changed successfully.",
    "info"
  );

  res.json({
    success: true,
    message: "Profile image updated successfully",
    data: { profileImage: staff.profileImage },
  });
});

/**
 * @desc    Get all staff members (Admin only)
 * @route   GET /api/staff
 * @access  Private/Admin
 */
exports.getAllStaff = asyncHandler(async (req, res) => {
  // Query parameters
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    role,
    department,
    isActive,
    search,
  } = req.query;

  // Build query
  const query = {};

  if (role) query.role = role;
  if (department) query.department = department;
  if (isActive !== undefined) query.isActive = isActive === "true";

  // Search by name or email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [staff, total] = await Promise.all([
    Staff.find(query).sort(sort).skip(skip).limit(limitNum).select("-password"),
    Staff.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      staff,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    },
  });
});

/**
 * @desc    Get staff member by ID (Admin only)
 * @route   GET /api/staff/:id
 * @access  Private/Admin
 */
exports.getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  res.json({
    success: true,
    data: { staff },
  });
});

/**
 * @desc    Create new staff member (Admin only)
 * @route   POST /api/staff
 * @access  Private/Admin
 */
exports.createStaff = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    department,
    dateOfBirth,
    gender,
    address,
    shift,
    salary,
  } = req.body;

  // Check if email exists
  const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
  if (existingStaff) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Create staff member
  const staff = await Staff.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    role: role || "staff",
    department,
    dateOfBirth,
    gender,
    address,
    shift,
    salary,
    isVerified: true, // Admin-created accounts are auto-verified
    createdBy: req.staff.id,
  });

  await sendNotification(
    staff._id,
    "Welcome to BookAVibe! 🎉",
    `Your account has been created by admin. You can now login with your email and password.`,
    "info"
  );

  res.status(201).json({
    success: true,
    message: "Staff member created successfully",
    data: { staff },
  });
});

/**
 * @desc    Update staff member (Admin only)
 * @route   PUT /api/staff/:id
 * @access  Private/Admin
 */
exports.updateStaff = asyncHandler(async (req, res) => {
  // Fields that admin can update
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "role",
    "department",
    "dateOfBirth",
    "gender",
    "address",
    "shift",
    "salary",
    "isActive",
    "isVerified",
    "emergencyContact",
  ];

  // Filter allowed fields
  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  updates.updatedBy = req.staff.id;

  const staff = await Staff.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await sendNotification(
    staff._id,
    "Profile Updated by Admin",
    "Your profile information has been updated by an administrator.",
    "info"
  );

  res.json({
    success: true,
    message: "Staff member updated successfully",
    data: { staff },
  });
});

/**
 * @desc    Update staff role (Admin only)
 * @route   PUT /api/staff/:id/role
 * @access  Private/Admin
 */
exports.updateStaffRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !["admin", "kitchen"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Must be admin or kitchen",
    });
  }

  // Prevent admin from changing their own role
  if (req.params.id === req.staff.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own role",
    });
  }

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    { role, updatedBy: req.staff.id },
    { new: true, runValidators: true }
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await sendNotification(
    staff._id,
    "Role Updated",
    `Your role has been updated to: ${role}`,
    "warning"
  );

  res.json({
    success: true,
    message: "Staff role updated successfully",
    data: { staff },
  });
});

/**
 * @desc    Deactivate staff member (Admin only)
 * @route   PUT /api/staff/:id/deactivate
 * @access  Private/Admin
 */
exports.deactivateStaff = asyncHandler(async (req, res) => {
  // Prevent admin from deactivating themselves
  if (req.params.id === req.staff.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot deactivate your own account",
    });
  }

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    { isActive: false, updatedBy: req.staff.id },
    { new: true }
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await sendNotification(
    staff._id,
    "Account Deactivated",
    "Your account has been deactivated. Please contact administrator.",
    "error"
  );

  res.json({
    success: true,
    message: "Staff member deactivated successfully",
    data: { staff },
  });
});

/**
 * @desc    Activate staff member (Admin only)
 * @route   PUT /api/staff/:id/activate
 * @access  Private/Admin
 */
exports.activateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    { isActive: true, updatedBy: req.staff.id },
    { new: true }
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await sendNotification(
    staff._id,
    "Account Activated",
    "Your account has been activated. You can now login.",
    "success"
  );

  res.json({
    success: true,
    message: "Staff member activated successfully",
    data: { staff },
  });
});

/**
 * @desc    Delete staff member (Admin only)
 * @route   DELETE /api/staff/:id
 * @access  Private/Admin
 */
exports.deleteStaff = asyncHandler(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.staff.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own account",
    });
  }

  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  await staff.deleteOne();

  res.json({
    success: true,
    message: "Staff member deleted successfully",
  });
});

/**
 * @desc    Get staff statistics (Admin only)
 * @route   GET /api/staff/stats
 * @access  Private/Admin
 */
exports.getStaffStats = asyncHandler(async (req, res) => {
  const [
    totalStaff,
    activeStaff,
    inactiveStaff,
    roleStats,
    departmentStats,
    recentJoins,
  ] = await Promise.all([
    Staff.countDocuments(),
    Staff.countDocuments({ isActive: true }),
    Staff.countDocuments({ isActive: false }),
    Staff.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $project: { role: "$_id", count: 1, _id: 0 } },
    ]),
    Staff.aggregate([
      { $match: { department: { $exists: true, $ne: null } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } },
    ]),
    Staff.find()
      .sort("-createdAt")
      .limit(5)
      .select("firstName lastName role department createdAt"),
  ]);

  // Transform role stats to object
  const roleStatsObj = {};
  roleStats.forEach((r) => {
    roleStatsObj[r.role] = r.count;
  });

  // Transform department stats to object
  const departmentStatsObj = {};
  departmentStats.forEach((d) => {
    departmentStatsObj[d.department] = d.count;
  });

  res.json({
    success: true,
    data: {
      total: totalStaff,
      active: activeStaff,
      inactive: inactiveStaff,
      byRole: roleStatsObj,
      byDepartment: departmentStatsObj,
      recentJoins,
    },
  });
});

/**
 * @desc    Get notifications for current staff
 * @route   GET /api/staff/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const staff = await Staff.findById(req.staff.id).select("notifications");

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  let notifications = staff.notifications || [];

  // Sort by createdAt descending
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Filter unread only
  if (unreadOnly === "true") {
    notifications = notifications.filter((n) => !n.isRead);
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedNotifications = notifications.slice(startIndex, endIndex);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    data: {
      notifications: paginatedNotifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: notifications.length,
        pages: Math.ceil(notifications.length / limitNum),
      },
    },
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/staff/notifications/:notificationId/read
 * @access  Private
 */
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const staff = await Staff.findOneAndUpdate(
    {
      _id: req.staff.id,
      "notifications._id": notificationId,
    },
    {
      $set: { "notifications.$.isRead": true },
    },
    { new: true }
  ).select("notifications");

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    message: "Notification marked as read",
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/staff/notifications/read-all
 * @access  Private
 */
exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Staff.findByIdAndUpdate(req.staff.id, {
    $set: { "notifications.$[].isRead": true },
  });

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/staff/notifications/:notificationId
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const staff = await Staff.findByIdAndUpdate(
    req.staff.id,
    {
      $pull: { notifications: { _id: notificationId } },
    },
    { new: true }
  );

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  res.json({
    success: true,
    message: "Notification deleted",
  });
});

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/staff/notifications
 * @access  Private
 */
exports.clearAllNotifications = asyncHandler(async (req, res) => {
  await Staff.findByIdAndUpdate(req.staff.id, {
    $set: { notifications: [] },
  });

  res.json({
    success: true,
    message: "All notifications cleared",
  });
});

/**
 * @desc    Get pending registrations (Admin only)
 * @route   GET /api/staff/pending
 * @access  Private/Admin
 */
exports.getPendingRegistrations = asyncHandler(async (req, res) => {
  const pendingStaff = await Staff.find({ registrationStatus: "pending" })
    .select("-password")
    .sort("-createdAt");

  res.json({
    success: true,
    data: {
      pending: pendingStaff,
      count: pendingStaff.length,
    },
  });
});

/**
 * @desc    Approve registration and assign role (Admin only)
 * @route   PUT /api/staff/:id/approve
 * @access  Private/Admin
 */
exports.approveRegistration = asyncHandler(async (req, res) => {
  const { role } = req.body;

  // Validate role
  if (!role || !["admin", "kitchen"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Please specify a valid role (admin or kitchen)",
    });
  }

  // Find the pending staff member
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  if (staff.registrationStatus !== "pending") {
    return res.status(400).json({
      success: false,
      message: "This registration is not pending",
    });
  }

  // If assigning admin role, check the limit
  if (role === "admin") {
    const config = await CafeConfig.getConfig();
    const adminCount = await Staff.countDocuments({
      role: "admin",
      registrationStatus: "approved",
    });

    if (adminCount >= config.maxAdminLimit) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign admin role. Maximum admin limit (${config.maxAdminLimit}) reached.`,
      });
    }
  }

  // Approve the registration
  staff.role = role;
  staff.registrationStatus = "approved";
  staff.approvedBy = req.staff.id;
  staff.approvedAt = new Date();
  // Note: Email verification is still required - user must verify their email separately
  await staff.save();

  // Notify the user
  await sendNotification(
    staff._id,
    "Registration Approved! \uD83C\uDF89",
    `Your registration has been approved. You are now a ${role}. You can login to your account.`,
    "success"
  );

  res.json({
    success: true,
    message: "Registration approved successfully",
    data: { staff },
  });
});

/**
 * @desc    Reject registration (Admin only)
 * @route   PUT /api/staff/:id/reject
 * @access  Private/Admin
 */
exports.rejectRegistration = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found",
    });
  }

  if (staff.registrationStatus !== "pending") {
    return res.status(400).json({
      success: false,
      message: "This registration is not pending",
    });
  }

  // Reject the registration
  staff.registrationStatus = "rejected";
  await staff.save();

  // Notify the user
  await sendNotification(
    staff._id,
    "Registration Rejected",
    reason || "Your registration has been rejected. Please contact the administrator.",
    "error"
  );

  res.json({
    success: true,
    message: "Registration rejected",
    data: { staff },
  });
});

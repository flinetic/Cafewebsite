/**
 * Authentication Controller
 * Handles staff registration, login, email verification, password reset
 * @module controllers/authController
 */

require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Staff = require("../models/Staff");
const CafeConfig = require("../models/CafeConfig");
const { sendEmail, emailTemplates } = require("../utils/email");
const { sendNotification } = require("../utils/sendNotification");
const asyncHandler = require("../middleware/asyncHandler");

// Token configuration
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

/**
 * Generate Access Token
 * @param {Object} staff - Staff document
 * @returns {string} JWT access token
 */
const generateAccessToken = (staff) => {
  return jwt.sign(
    {
      id: staff._id,
      email: staff.email,
      role: staff.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
};

/**
 * Generate Refresh Token
 * @param {Object} staff - Staff document
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (staff) => {
  return jwt.sign(
    {
      id: staff._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );
};

/**
 * Generate verification/reset token
 * @returns {Object} Token and hashed token
 */
const generateCryptoToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashedToken };
};

/**
 * @desc    Check if admin exists and can register as admin
 * @route   GET /api/auth/admin-exists
 * @access  Public
 */
exports.checkAdminExists = asyncHandler(async (req, res) => {
  const adminCount = await Staff.countDocuments({
    role: "admin",
    registrationStatus: "approved"
  });
  const config = await CafeConfig.getConfig();

  res.json({
    success: true,
    data: {
      adminExists: adminCount > 0,
      adminCount,
      maxAdminLimit: config.maxAdminLimit,
      canRegisterAsAdmin: adminCount < config.maxAdminLimit
    }
  });
});

/**
 * @desc    Register new staff member
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
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
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide firstName, lastName, email and password",
    });
  }

  // Check if staff already exists
  const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
  if (existingStaff) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Get cafe config for admin limit
  const config = await CafeConfig.getConfig();

  // Count existing approved admins
  const adminCount = await Staff.countDocuments({
    role: "admin",
    registrationStatus: "approved"
  });

  // Determine if this user can be registered as admin
  const canRegisterAsAdmin = adminCount < config.maxAdminLimit;
  const isFirstAdmin = adminCount === 0;

  // Determine role and registration status
  let assignedRole = null;
  let registrationStatus = "pending";

  if (isFirstAdmin && role === "admin") {
    // First admin registration - auto-approve
    assignedRole = "admin";
    registrationStatus = "approved";
  } else if (role === "admin" && canRegisterAsAdmin) {
    // Additional admin registration (if admin limit not reached)
    // Still needs approval by existing admin
    assignedRole = null;
    registrationStatus = "pending";
  } else {
    // Normal user registration - pending approval
    assignedRole = null;
    registrationStatus = "pending";
  }

  // Generate verification token
  const { token: verificationToken, hashedToken } = generateCryptoToken();

  // Create new staff member
  const staff = await Staff.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    role: assignedRole,
    registrationStatus,
    department,
    dateOfBirth,
    gender,
    address,
    shift,
    verificationToken: hashedToken,
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    createdBy: req.staff?._id || null,
  });

  // For first admin, auto-approve and auto-login but still send verification email
  if (isFirstAdmin && assignedRole === "admin") {
    // Generate tokens for first admin (auto-login)
    const accessToken = generateAccessToken(staff);
    const refreshToken = generateRefreshToken(staff);

    // Send verification email to first admin
    const backendVerifyURL = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        to: staff.email,
        subject: "Verify Your Email - BookAVibe Cafe",
        html: emailTemplates.verifyEmail(staff.firstName, backendVerifyURL),
      });
      console.log("First admin verification email sent to:", staff.email);
    } catch (emailError) {
      console.error("Email sending failed for first admin:", emailError);
    }

    // Send welcome notification
    await sendNotification(
      staff._id,
      "Welcome to BookAVibe! 🎉",
      `Welcome ${staff.firstName}! You are the first admin. Please verify your email to access all features.`,
      "success"
    );

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully! Please verify your email to access all features.",
      data: {
        staff: {
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          role: staff.role,
          registrationStatus: staff.registrationStatus,
          isEmailVerified: staff.isVerified,
          isActive: staff.isActive,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  }

  // For pending registrations, send notification but no tokens
  // Send verification email
  const backendVerifyURL = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/verify-email/${verificationToken}`;

  try {
    await sendEmail({
      to: staff.email,
      subject: "Verify Your Email - BookAVibe Cafe",
      html: emailTemplates.verifyEmail(staff.firstName, backendVerifyURL),
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
  }

  // Send notification to all admins about new registration
  const admins = await Staff.find({ role: "admin", registrationStatus: "approved" });
  for (const admin of admins) {
    await sendNotification(
      admin._id,
      "New Registration Request",
      `${staff.firstName} ${staff.lastName} (${staff.email}) has registered and is waiting for approval.`,
      "info"
    );
  }

  // Send notification to the new user
  await sendNotification(
    staff._id,
    "Registration Received! 📝",
    `Welcome ${staff.firstName}! Your registration has been received. Please wait for admin approval.`,
    "info"
  );

  res.status(201).json({
    success: true,
    message: "Registration submitted! Please wait for admin approval.",
    data: {
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        registrationStatus: staff.registrationStatus,
      },
      // No tokens for pending users
      tokens: null,
      isPending: true,
    },
  });
});

/**
 * @desc    Login staff member
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  try {
    // Find and validate staff
    const staff = await Staff.findByCredentials(
      email.toLowerCase(),
      password
    );

    // Note: Email verification is no longer blocking login
    // Users can login without verified email, but certain features are restricted on the frontend

    // Check registration approval status
    if (staff.registrationStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your registration is pending approval. Please wait for admin to approve your account.",
        isPending: true,
      });
    }

    if (staff.registrationStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your registration has been rejected. Please contact the administrator.",
        isRejected: true,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(staff);
    const refreshToken = generateRefreshToken(staff);

    // Update last login
    staff.lastLogin = Date.now();
    await staff.save();

    // Send login notification
    await sendNotification(
      staff._id,
      "New Login Detected",
      `A new login was detected on your account at ${new Date().toLocaleString()}.`,
      "info"
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        staff: {
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          fullName: staff.fullName,
          email: staff.email,
          role: staff.role,
          profileImage: staff.profileImage,
          department: staff.department,
          isEmailVerified: staff.isVerified,
          isActive: staff.isActive,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Hash the token from URL
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find staff with valid token
  const staff = await Staff.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  }).select("+verificationToken +verificationTokenExpire");

  if (!staff) {
    // Redirect to frontend with error status
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendURL}/email-verified?status=failed`);
  }

  // Update verification status
  staff.isVerified = true;
  staff.verificationToken = undefined;
  staff.verificationTokenExpire = undefined;
  await staff.save();

  // Send notification
  await sendNotification(
    staff._id,
    "Email Verified ✓",
    "Your email has been successfully verified. You can now access all features.",
    "success"
  );

  // Redirect to frontend email verified page
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendURL}/email-verified`);
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }

  const staff = await Staff.findOne({ email: email.toLowerCase() });

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: "No account found with this email",
    });
  }

  if (staff.isVerified) {
    return res.status(400).json({
      success: false,
      message: "Email is already verified",
    });
  }

  // Generate new verification token
  const { token: verificationToken, hashedToken } = generateCryptoToken();

  staff.verificationToken = hashedToken;
  staff.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  await staff.save();

  // Send verification email
  const verifyURL = `${process.env.BACKEND_URL || "http://localhost:5000"
    }/api/auth/verify-email/${verificationToken}`;

  await sendEmail({
    to: staff.email,
    subject: "Verify Your Email - BookAVibe Cafe",
    html: emailTemplates.verifyEmail(staff.firstName, verifyURL),
  });

  res.json({
    success: true,
    message: "Verification email sent successfully",
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }

  const staff = await Staff.findOne({ email: email.toLowerCase() });

  if (!staff) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: "If an account exists with this email, a reset link will be sent.",
    });
  }

  // Generate reset token
  const { token: resetToken, hashedToken } = generateCryptoToken();

  staff.resetPasswordToken = hashedToken;
  staff.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await staff.save();

  // Send reset email
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: staff.email,
      subject: "Password Reset Request - BookAVibe Cafe",
      html: emailTemplates.resetPassword(staff.firstName, resetURL),
    });

    // Notification
    await sendNotification(
      staff._id,
      "Password Reset Requested",
      "A password reset link has been sent to your email. It expires in 30 minutes.",
      "warning"
    );
  } catch (emailError) {
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpire = undefined;
    await staff.save();

    return res.status(500).json({
      success: false,
      message: "Email could not be sent. Please try again later.",
    });
  }

  res.json({
    success: true,
    message: "Password reset email sent successfully",
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Please provide new password",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  // Hash token from URL
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const staff = await Staff.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!staff) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  // Update password
  staff.password = password;
  staff.resetPasswordToken = undefined;
  staff.resetPasswordExpire = undefined;
  staff.loginAttempts = 0;
  staff.lockUntil = undefined;
  await staff.save();

  // Notification
  await sendNotification(
    staff._id,
    "Password Changed",
    "Your password has been successfully reset.",
    "success"
  );

  res.json({
    success: true,
    message: "Password reset successful! You can now login with your new password.",
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find staff
    const staff = await Staff.findById(decoded.id);

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (!staff.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(staff);

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
});

/**
 * @desc    Logout
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  // For stateless JWT, we just return success
  // In production, you might want to blacklist the token
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.staff.id);

  res.json({
    success: true,
    data: {
      staff,
    },
  });
});

/**
 * @desc    Update password (when logged in)
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  const staff = await Staff.findById(req.staff.id).select("+password");

  // Check current password
  const isMatch = await staff.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  staff.password = newPassword;
  await staff.save();

  // Generate new tokens
  const accessToken = generateAccessToken(staff);
  const refreshToken = generateRefreshToken(staff);

  // Notification
  await sendNotification(
    staff._id,
    "Password Updated",
    "Your password has been successfully changed.",
    "success"
  );

  res.json({
    success: true,
    message: "Password updated successfully",
    data: {
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});
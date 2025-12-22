/**
 * Authentication Controller
 * Handles staff registration, login, email verification, password reset
 * @module controllers/authController
 */

require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Staff = require("../models/Staff");
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
 * @desc    Register new staff member
 * @route   POST /api/auth/register
 * @access  Public (for first admin) / Admin only (for others)
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

  // Check if this is the first user (make them admin)
  const staffCount = await Staff.countDocuments();
  const assignedRole = staffCount === 0 ? "admin" : role || "staff";

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
    department,
    dateOfBirth,
    gender,
    address,
    shift,
    verificationToken: hashedToken,
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    createdBy: req.staff?._id || null,
  });

  // Send verification email
  const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const backendVerifyURL = `${
    process.env.BACKEND_URL || "http://localhost:5000"
  }/api/auth/verify-email/${verificationToken}`;

  try {
    await sendEmail({
      to: staff.email,
      subject: "Verify Your Email - BookAVibe Cafe",
      html: emailTemplates.verifyEmail(staff.firstName, backendVerifyURL),
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    // Don't fail registration if email fails
  }

  // Send welcome notification
  await sendNotification(
    staff._id,
    "Welcome to BookAVibe! 🎉",
    `Welcome ${staff.firstName}! Your account has been created. Please verify your email to continue.`,
    "info"
  );

  // Generate tokens
  const accessToken = generateAccessToken(staff);
  const refreshToken = generateRefreshToken(staff);

  // For first admin, auto-verify
  if (staffCount === 0) {
    staff.isVerified = true;
    await staff.save();
  }

  res.status(201).json({
    success: true,
    message:
      staffCount === 0
        ? "Admin account created successfully!"
        : "Registration successful! Please check your email to verify your account.",
    data: {
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        role: staff.role,
        isVerified: staff.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
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

    // Check email verification
    if (!staff.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your inbox for the verification link.",
        needsVerification: true,
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
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
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

  res.json({
    success: true,
    message: "Email verified successfully! You can now login.",
  });
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
  const verifyURL = `${
    process.env.BACKEND_URL || "http://localhost:5000"
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

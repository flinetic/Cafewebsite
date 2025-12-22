/**
 * Authentication Middleware
 * Verifies JWT token and attaches staff to request
 * @module middleware/auth
 */

const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Also check cookies for web clients
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find staff member
      const staff = await Staff.findById(decoded.id).select("-password");

      if (!staff) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid. Staff member not found.",
        });
      }

      // Check if account is active
      if (!staff.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact administrator.",
        });
      }

      // Attach staff to request
      req.staff = staff;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
          tokenExpired: true,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Token is invalid.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

/**
 * Optional authentication - doesn't require token but attaches staff if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const staff = await Staff.findById(decoded.id).select("-password");

        if (staff && staff.isActive) {
          req.staff = staff;
        }
      } catch (jwtError) {
        // Token invalid, continue without auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = protect;
module.exports.protect = protect;
module.exports.optionalAuth = optionalAuth;

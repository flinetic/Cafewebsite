/**
 * Role-Based Access Control Middleware
 * Restricts access based on staff roles
 * @module middleware/roleAuth
 */

/**
 * Authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if staff is attached (from auth middleware)
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if staff role is in allowed roles
    if (!roles.includes(req.staff.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${roles.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.staff) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.staff.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

/**
 * Admin or Chef middleware
 */
const adminOrChef = (req, res, next) => {
  if (!req.staff) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!["admin", "chef"].includes(req.staff.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or Chef privileges required.",
    });
  }

  next();
};

/**
 * All staff roles middleware (just needs to be authenticated)
 */
const allStaff = (req, res, next) => {
  if (!req.staff) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!["admin", "chef", "staff"].includes(req.staff.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Staff privileges required.",
    });
  }

  next();
};

/**
 * Check if user is owner or admin
 * Used for profile updates where user can update their own profile
 * or admin can update any profile
 */
const ownerOrAdmin = (paramName = "id") => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const resourceId = req.params[paramName];
    const isOwner = req.staff.id === resourceId || req.staff._id.toString() === resourceId;
    const isAdmin = req.staff.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources.",
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  adminOnly,
  adminOrChef,
  allStaff,
  ownerOrAdmin,
};

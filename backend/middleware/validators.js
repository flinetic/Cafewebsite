/**
 * Request Validation Middleware
 * Validates request body, params, and query using express-validator
 * @module middleware/validators
 */

const { body, param, query, validationResult } = require("express-validator");

/**
 * Handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-]{10,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("role")
    .optional()
    .isIn(["admin", "chef", "staff"])
    .withMessage("Role must be admin, chef, or staff"),

  body("department")
    .optional()
    .isIn(["kitchen", "service", "management", "cashier", "delivery"])
    .withMessage("Invalid department"),

  body("shift")
    .optional()
    .isIn(["morning", "afternoon", "evening", "night", "flexible"])
    .withMessage("Invalid shift"),
];

/**
 * Login validation rules
 */
const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Password update validation rules
 */
const passwordUpdateRules = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

/**
 * Profile update validation rules
 */
const profileUpdateRules = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-]{10,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Invalid gender value"),
];

/**
 * Staff management validation rules (for admin)
 */
const staffManagementRules = [
  body("role")
    .optional()
    .isIn(["admin", "chef", "staff"])
    .withMessage("Role must be admin, chef, or staff"),

  body("department")
    .optional()
    .isIn(["kitchen", "service", "management", "cashier", "delivery"])
    .withMessage("Invalid department"),

  body("shift")
    .optional()
    .isIn(["morning", "afternoon", "evening", "night", "flexible"])
    .withMessage("Invalid shift"),

  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),

  body("salary.amount")
    .optional()
    .isNumeric()
    .withMessage("Salary amount must be a number"),
];

/**
 * MongoDB ObjectId validation
 */
const mongoIdRules = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

/**
 * Pagination query validation
 */
const paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sort").optional().isString().withMessage("Sort must be a string"),
];

/**
 * Email validation rules
 */
const emailRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

/**
 * Password reset validation rules
 */
const passwordResetRules = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  passwordUpdateRules,
  profileUpdateRules,
  staffManagementRules,
  mongoIdRules,
  paginationRules,
  emailRules,
  passwordResetRules,
};

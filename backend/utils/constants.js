/**
 * Constants
 * Application-wide constants and configuration values
 * @module utils/constants
 */

// Staff roles
const ROLES = {
  ADMIN: "admin",
  CHEF: "chef",
  STAFF: "staff",
};

// All roles array
const ALL_ROLES = Object.values(ROLES);

// Departments
const DEPARTMENTS = {
  KITCHEN: "kitchen",
  SERVICE: "service",
  MANAGEMENT: "management",
  CASHIER: "cashier",
  DELIVERY: "delivery",
};

// All departments array
const ALL_DEPARTMENTS = Object.values(DEPARTMENTS);

// Shifts
const SHIFTS = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
  NIGHT: "night",
  FLEXIBLE: "flexible",
};

// All shifts array
const ALL_SHIFTS = Object.values(SHIFTS);

// Gender options
const GENDERS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer_not_to_say",
};

// All genders array
const ALL_GENDERS = Object.values(GENDERS);

// Notification types
const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// All notification types array
const ALL_NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPES);

// Payment frequencies
const PAYMENT_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  BI_WEEKLY: "bi-weekly",
  MONTHLY: "monthly",
};

// All payment frequencies array
const ALL_PAYMENT_FREQUENCIES = Object.values(PAYMENT_FREQUENCIES);

// Token expiration times
const TOKEN_EXPIRY = {
  ACCESS: "15m",
  REFRESH: "7d",
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours in ms
  PASSWORD_RESET: 30 * 60 * 1000, // 30 minutes in ms
};

// File upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Rate limiting
const RATE_LIMITS = {
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 10,
  },
  PASSWORD_RESET: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 5,
  },
  UPLOAD: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 20,
  },
};

// Account security
const ACCOUNT_SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION: 2 * 60 * 60 * 1000, // 2 hours in ms
  MIN_PASSWORD_LENGTH: 8,
};

module.exports = {
  ROLES,
  ALL_ROLES,
  DEPARTMENTS,
  ALL_DEPARTMENTS,
  SHIFTS,
  ALL_SHIFTS,
  GENDERS,
  ALL_GENDERS,
  NOTIFICATION_TYPES,
  ALL_NOTIFICATION_TYPES,
  PAYMENT_FREQUENCIES,
  ALL_PAYMENT_FREQUENCIES,
  TOKEN_EXPIRY,
  UPLOAD_LIMITS,
  PAGINATION,
  HTTP_STATUS,
  RATE_LIMITS,
  ACCOUNT_SECURITY,
};

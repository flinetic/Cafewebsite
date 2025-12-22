/**
 * Send Notification Utility
 * Handles in-app notifications for staff members
 * @module utils/sendNotification
 */

const Staff = require("../models/Staff");

/**
 * Send in-app notification to a staff member
 * @param {string} staffId - Staff member ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 */
const sendNotification = async (staffId, title, message, type = "info") => {
  try {
    // Validate type
    const validTypes = ["info", "success", "warning", "error"];
    if (!validTypes.includes(type)) {
      type = "info";
    }

    await Staff.findByIdAndUpdate(staffId, {
      $push: {
        notifications: {
          title,
          message,
          type,
          isRead: false,
          createdAt: new Date(),
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

/**
 * Send notification to multiple staff members
 * @param {Array} staffIds - Array of staff member IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
const sendBulkNotification = async (staffIds, title, message, type = "info") => {
  try {
    const validTypes = ["info", "success", "warning", "error"];
    if (!validTypes.includes(type)) {
      type = "info";
    }

    await Staff.updateMany(
      { _id: { $in: staffIds } },
      {
        $push: {
          notifications: {
            title,
            message,
            type,
            isRead: false,
            createdAt: new Date(),
          },
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    return false;
  }
};

/**
 * Send notification to all staff members with a specific role
 * @param {string} role - Role to target (admin, chef, staff)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
const sendNotificationByRole = async (role, title, message, type = "info") => {
  try {
    const validTypes = ["info", "success", "warning", "error"];
    if (!validTypes.includes(type)) {
      type = "info";
    }

    const validRoles = ["admin", "chef", "staff"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role");
    }

    await Staff.updateMany(
      { role, isActive: true },
      {
        $push: {
          notifications: {
            title,
            message,
            type,
            isRead: false,
            createdAt: new Date(),
          },
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error sending notification by role:", error);
    return false;
  }
};

/**
 * Send notification to all active staff members
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
const sendNotificationToAll = async (title, message, type = "info") => {
  try {
    const validTypes = ["info", "success", "warning", "error"];
    if (!validTypes.includes(type)) {
      type = "info";
    }

    await Staff.updateMany(
      { isActive: true },
      {
        $push: {
          notifications: {
            title,
            message,
            type,
            isRead: false,
            createdAt: new Date(),
          },
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error sending notification to all:", error);
    return false;
  }
};

/**
 * Mark all notifications as read for a staff member
 * @param {string} staffId - Staff member ID
 */
const markAllAsRead = async (staffId) => {
  try {
    await Staff.findByIdAndUpdate(staffId, {
      $set: { "notifications.$[].isRead": true },
    });

    return true;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
};

/**
 * Delete old notifications (older than specified days)
 * @param {number} days - Number of days to keep notifications
 */
const cleanupOldNotifications = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await Staff.updateMany(
      {},
      {
        $pull: {
          notifications: { createdAt: { $lt: cutoffDate } },
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    return false;
  }
};

module.exports = {
  sendNotification,
  sendBulkNotification,
  sendNotificationByRole,
  sendNotificationToAll,
  markAllAsRead,
  cleanupOldNotifications,
};

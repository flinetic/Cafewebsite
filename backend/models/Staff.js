const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const staffSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s-]{10,15}$/, "Please provide a valid phone number"],
    },

    // Role & Permissions
    role: {
      type: String,
      enum: {
        values: ["admin", "chef", "staff"],
        message: "Role must be admin, chef, or staff",
      },
      default: "staff",
      required: true,
    },

    // Profile Information
    profileImage: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },

    // Employment Details
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    department: {
      type: String,
      enum: ["kitchen", "service", "management", "cashier", "delivery"],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: "INR" },
      paymentFrequency: {
        type: String,
        enum: ["daily", "weekly", "bi-weekly", "monthly"],
        default: "monthly",
      },
    },
    shift: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night", "flexible"],
      default: "flexible",
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // Verification & Reset Tokens
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpire: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },

    // Emergency Contact
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    // Notifications
    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
          type: String,
          enum: ["info", "success", "warning", "error"],
          default: "info",
        },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Settings
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance (email and employeeId already indexed via unique: true)
staffSchema.index({ role: 1 });
staffSchema.index({ isActive: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ createdAt: -1 });

// Virtual for full name
staffSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
staffSchema.pre("save", async function (next) {
  // Only hash password if it's modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate employee ID
staffSchema.pre("save", async function (next) {
  if (this.isNew && !this.employeeId) {
    const prefix = this.role.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.employeeId = `${prefix}-${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to generate avatar if not provided
staffSchema.pre("save", function (next) {
  if (this.isNew && !this.profileImage) {
    const name = encodeURIComponent(`${this.firstName} ${this.lastName}`);
    this.profileImage = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=256`;
  }
  next();
});

// Instance method to compare password
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
staffSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
staffSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
staffSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

// Static method to find by credentials
staffSchema.statics.findByCredentials = async function (email, password) {
  const staff = await this.findOne({ email }).select("+password");

  if (!staff) {
    throw new Error("Invalid email or password");
  }

  if (!staff.isActive) {
    throw new Error("Account is deactivated. Please contact administrator.");
  }

  if (staff.isLocked()) {
    throw new Error(
      "Account is temporarily locked. Please try again later or reset your password."
    );
  }

  const isMatch = await staff.comparePassword(password);

  if (!isMatch) {
    await staff.incrementLoginAttempts();
    throw new Error("Invalid email or password");
  }

  // Reset login attempts on successful login
  await staff.resetLoginAttempts();

  return staff;
};

// Static method to get staff by role
staffSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true }).select("-password");
};

// Remove sensitive data when converting to JSON
staffSchema.methods.toJSON = function () {
  const staffObject = this.toObject();
  delete staffObject.password;
  delete staffObject.verificationToken;
  delete staffObject.verificationTokenExpire;
  delete staffObject.resetPasswordToken;
  delete staffObject.resetPasswordExpire;
  delete staffObject.loginAttempts;
  delete staffObject.lockUntil;
  return staffObject;
};

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;

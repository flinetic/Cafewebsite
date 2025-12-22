/**
 * Create Initial Admin Script
 * Creates the first admin user for the cafe management system
 * Run: npm run create-admin
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Staff = require("../models/Staff");
const connectDB = require("../config/db");

const createAdmin = async () => {
  try {
    console.log("\n========================================");
    console.log("☕ BookAVibe - Create Admin Script");
    console.log("========================================\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@bookavibe.com";
    const adminPassword = process.env.ADMIN_PASS || "Admin@123456";

    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log(`⚠️  Admin already exists: ${adminEmail}`);
      console.log("   Use the existing credentials to login.\n");
      process.exit(0);
    }

    // Create admin
    const admin = await Staff.create({
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: "admin",
      department: "management",
      isVerified: true,
      isActive: true,
      phone: "+91 9999999999",
    });

    console.log("✅ Admin created successfully!\n");
    console.log("========================================");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 Role:", admin.role);
    console.log("🆔 Employee ID:", admin.employeeId);
    console.log("========================================\n");
    console.log("⚠️  IMPORTANT: Change the password after first login!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();

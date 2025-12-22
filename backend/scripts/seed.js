/**
 * Seed Database Script
 * Creates sample staff members for development/testing
 * Run: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Staff = require("../models/Staff");
const connectDB = require("../config/db");

// Sample staff data
const staffData = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "admin@bookavibe.com",
    password: "Admin@123456",
    role: "admin",
    department: "management",
    phone: "+91 9876543210",
    shift: "flexible",
    isVerified: true,
    isActive: true,
    gender: "male",
    address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
    },
  },
  {
    firstName: "Ravi",
    lastName: "Kumar",
    email: "chef@bookavibe.com",
    password: "Chef@123456",
    role: "chef",
    department: "kitchen",
    phone: "+91 9876543211",
    shift: "morning",
    isVerified: true,
    isActive: true,
    gender: "male",
    salary: {
      amount: 35000,
      currency: "INR",
      paymentFrequency: "monthly",
    },
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "chef2@bookavibe.com",
    password: "Chef@123456",
    role: "chef",
    department: "kitchen",
    phone: "+91 9876543212",
    shift: "evening",
    isVerified: true,
    isActive: true,
    gender: "female",
    salary: {
      amount: 32000,
      currency: "INR",
      paymentFrequency: "monthly",
    },
  },
  {
    firstName: "Amit",
    lastName: "Patel",
    email: "staff1@bookavibe.com",
    password: "Staff@123456",
    role: "staff",
    department: "service",
    phone: "+91 9876543213",
    shift: "morning",
    isVerified: true,
    isActive: true,
    gender: "male",
    salary: {
      amount: 18000,
      currency: "INR",
      paymentFrequency: "monthly",
    },
  },
  {
    firstName: "Neha",
    lastName: "Gupta",
    email: "staff2@bookavibe.com",
    password: "Staff@123456",
    role: "staff",
    department: "service",
    phone: "+91 9876543214",
    shift: "afternoon",
    isVerified: true,
    isActive: true,
    gender: "female",
    salary: {
      amount: 18000,
      currency: "INR",
      paymentFrequency: "monthly",
    },
  },
  {
    firstName: "Rahul",
    lastName: "Singh",
    email: "cashier@bookavibe.com",
    password: "Staff@123456",
    role: "staff",
    department: "cashier",
    phone: "+91 9876543215",
    shift: "flexible",
    isVerified: true,
    isActive: true,
    gender: "male",
    salary: {
      amount: 20000,
      currency: "INR",
      paymentFrequency: "monthly",
    },
  },
  {
    firstName: "Anita",
    lastName: "Verma",
    email: "delivery@bookavibe.com",
    password: "Staff@123456",
    role: "staff",
    department: "delivery",
    phone: "+91 9876543216",
    shift: "evening",
    isVerified: true,
    isActive: true,
    gender: "female",
    salary: {
      amount: 15000,
      currency: "INR",
      paymentFrequency: "monthly",
    },
  },
];

const seedDatabase = async () => {
  try {
    console.log("\n========================================");
    console.log("☕ BookAVibe - Database Seed Script");
    console.log("========================================\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Ask for confirmation
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "⚠️  This will DELETE all existing staff data. Continue? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() !== "yes") {
          console.log("\n❌ Seed cancelled.\n");
          rl.close();
          process.exit(0);
        }

        rl.close();

        try {
          // Delete existing staff
          await Staff.deleteMany({});
          console.log("🗑️  Cleared existing staff data\n");

          // Insert new staff
          console.log("📝 Creating staff members...\n");

          for (const data of staffData) {
            const staff = await Staff.create(data);
            console.log(
              `   ✅ Created: ${staff.fullName} (${staff.role}) - ${staff.email}`
            );
          }

          console.log("\n========================================");
          console.log("✅ Database seeded successfully!");
          console.log(`   Created ${staffData.length} staff members`);
          console.log("========================================\n");

          console.log("📋 Login Credentials:");
          console.log("----------------------------------------");
          console.log("Admin:   admin@bookavibe.com / Admin@123456");
          console.log("Chef:    chef@bookavibe.com / Chef@123456");
          console.log("Staff:   staff1@bookavibe.com / Staff@123456");
          console.log("----------------------------------------\n");

          process.exit(0);
        } catch (err) {
          console.error("❌ Error seeding database:", err.message);
          process.exit(1);
        }
      }
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();

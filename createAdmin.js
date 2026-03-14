const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Delete old admin
    await User.deleteMany({ email: "admin@example.com" });

    // Hash password safely
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash("Benja312", 10);
    } catch (hashErr) {
      console.error("Error hashing password:", hashErr.message);
      process.exit(1);
    }

    const admin = new User({
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    try {
      await admin.save();
      console.log("Admin created successfully!");
    } catch (saveErr) {
      console.error("Error saving admin:", saveErr.message);
    }

    process.exit(0);
  } catch (err) {
    console.error("MongoDB connection or script error:", err.message);
    process.exit(1);
  }
}

main();
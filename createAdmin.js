// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const User = require("./models/User");
// require("dotenv").config();

// async function main() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB connected");

//     // Delete old admin
//     await User.deleteMany({ email: "admin@example.com" });

//     // Hash password safely
//     let hashedPassword;
//     try {
//       hashedPassword = await bcrypt.hash("Benja312", 10);
//     } catch (hashErr) {
//       console.error("Error hashing password:", hashErr.message);
//       process.exit(1);
//     }

//     const admin = new User({
//       name: "Super Admin",
//       email: "admin@example.com",
//       password: hashedPassword,
//       role: "admin",
//     });

//     try {
//       await admin.save();
//       console.log("Admin created successfully!");
//     } catch (saveErr) {
//       console.error("Error saving admin:", saveErr.message);
//     }

//     process.exit(0);
//   } catch (err) {
//     console.error("MongoDB connection or script error:", err.message);
//     process.exit(1);
//   }
// }

// main();
// Compare
// const bcrypt = require("bcryptjs");

// const password = "Benja312"; // the password you are testing
// const hash = "$2b$10$smImrcZyb9Ns7dG7VdlDKO3Ixgfp1ufc3pLkibxqT6gQjwE0GXbeS"; // the hash from your DB

// bcrypt.compare(password, hash).then(result => {
//   console.log("Do they match?", result); // true or false
// });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // adjust path if needed

require("dotenv").config(); // if using .env for MongoDB URI

const MONGO_URI = process.env.MONGO_URI // change your DB name

async function resetPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const email = "admin@example.com"; 
    const newPassword = "Benja312";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email }, { password: hashedPassword });
    console.log("Password updated successfully!");

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

resetPassword();
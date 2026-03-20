// const mongoose = require("mongoose");

// // Subdocument schema for borrow history
// const BorrowHistorySchema = new mongoose.Schema({
//   amount: { type: Number, required: true },
//   dateBorrowed: { type: Date, default: Date.now },
//   dateCleared: { type: Date },
//   status: { type: String, enum: ["Active", "Cleared"], default: "Active" },
// });

// // Main Borrower schema
// const BorrowerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     customerID: { type: Number, required: true, unique: true },
//     phone: { type: String, required: true },
//     dob: { type: Date, required: true },
//     email: { type: String },
//     refereeName: { type: String },
//     refereePhone: { type: String },
//     balance: { type: Number, default: 0 },
//     borrowHistory: { type: [BorrowHistorySchema], default: [] },
//     totalTimesBorrowed: { type: Number, default: 0 },
//     tags: [{ type: String }],
//     status: { type: String, enum: ["Called", "Unreachable", null], default: null },
//     statusUpdatedAt: { type: Date }, 
//     notes: { type: String, default: "" }, 
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Borrower", BorrowerSchema);

const mongoose = require("mongoose");

// Subdocument schema for borrow history
const BorrowHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dateBorrowed: { type: Date, default: Date.now },
  dateCleared: { type: Date },
  status: { type: String, enum: ["Active", "Cleared"], default: "Active" },
});

// Main Borrower schema
const BorrowerSchema = new mongoose.Schema(
  {
    // 🔹 Personal Details (UPDATED)
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },

    nationalId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    altPhoneNumber: { type: String },
    location: { type: String },

    // 🔹 Referees
    referee1Name: { type: String },
    referee1Phone: { type: String },
    referee2Name: { type: String },
    referee2Phone: { type: String },

    // 🔹 Photos (KYC)
    facePhoto: { type: String },
    idPhoto: { type: String },

    // 🔹 Optional existing fields
    customerID: { type: Number, unique: true },
    dob: { type: Date },
    email: { type: String },

    // 🔹 Loan Tracking
    balance: { type: Number, default: 0 },
    borrowHistory: { type: [BorrowHistorySchema], default: [] },
    totalTimesBorrowed: { type: Number, default: 0 },

    // 🔹 Metadata
    tags: [{ type: String }],
    status: { type: String, enum: ["Called", "Unreachable", null], default: null },
    statusUpdatedAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Borrower", BorrowerSchema);
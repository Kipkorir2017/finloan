const mongoose = require("mongoose");

const BorrowHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dateBorrowed: { type: Date, default: Date.now },
  dateCleared: { type: Date },
  status: { type: String, enum: ["Active", "Cleared"], default: "Active" },
});

const BorrowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String },
  refereeName: { type: String },
  refereePhone: { type: String },
  balance: { type: Number, default: 0 },
  borrowHistory: [BorrowHistorySchema],
  totalTimesBorrowed: { type: Number, default: 0 },
  tags: [{ type: String }], // New / Old
  status: { type: String, enum: ["Called", "Unreachable", null], default: null },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Borrower", BorrowerSchema);
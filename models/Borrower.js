const mongoose = require("mongoose");

const BorrowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  amount: { type: Number, required: true },
  email: { type: String },
  refereeName: { type: String },
  refereePhone: { type: String },
  status: { type: String, enum: ["Called", "Unreachable", null], default: null },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Borrower", BorrowerSchema);
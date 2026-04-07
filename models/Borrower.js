

const mongoose = require("mongoose");

const BorrowHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },

  
  dateBorrowed: { type: Date, default: Date.now },

  dueDate: { type: Date, required: true },
  dateCleared: { type: Date },

  status: {
    type: String,
    enum: ["Pending", "Active", "Rejected", "Overdue", "Cleared"],
    default: "Pending",
  },

  contactStatus: {
    type: String,
    enum: ["Called", "Unreachable", null],
    default: null,
  },

  contactUpdatedAt: { type: Date },

  //Interest amount (KES value)
  interest: { type: Number, default: 0 },

  // NEW: Interest rate (0.15, 0.2, 0.25)
  interestRate: { type: Number },

  // NEW: Amount customer actually receives
  netDisbursed: { type: Number },

  // For future daily penalty logic
  lastInterestAppliedAt: { type: Date },

  repayments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],

  notes: [
    {
      text: String,
      date: { type: Date, default: Date.now },
      agent: String,
    },
  ],
});

const BorrowerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nationalId: { type: Number, required: true, unique: true },
    phone: { type: String, required: true },
    altPhoneNumber: String,
    location: String,
    refereeName: String,
    refereePhone: String,
    email: String,
    dob: Date,

    // This represents amount OWED (not disbursed)
    balance: { type: Number, default: 0 },

    borrowHistory: { type: [BorrowHistorySchema], default: [] },

    totalTimesBorrowed: { type: Number, default: 0 },

    // Used for risk tagging later
    tags: [{ type: String }], // e.g. ["Risk", "Defaulter"]

    notes: [
      {
        text: String,
        date: { type: Date, default: Date.now },
        agent: String,
      },
    ],
  },
  { timestamps: true }
);

//  INDEXES 
BorrowerSchema.index({ "borrowHistory.status": 1 });
BorrowerSchema.index({ "borrowHistory.dueDate": 1 });
BorrowerSchema.index({ "borrowHistory.dateBorrowed": 1 });

module.exports = mongoose.model("Borrower", BorrowerSchema);
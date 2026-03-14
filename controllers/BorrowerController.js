const Borrower = require("../models/Borrower"); 

// Helper to reset status if it's a new day
const resetStatusIfNewDay = async (borrower) => {
  if (borrower.statusUpdatedAt) {
    const lastUpdate = new Date(borrower.statusUpdatedAt);
    const now = new Date();
    if (
      lastUpdate.getFullYear() !== now.getFullYear() ||
      lastUpdate.getMonth() !== now.getMonth() ||
      lastUpdate.getDate() !== now.getDate()
    ) {
      borrower.status = null;
      borrower.statusUpdatedAt = null;
      await borrower.save();
    }
  }
};

// Get all active borrowers (balance > 0)
exports.getActiveBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find({ balance: { $gt: 0 } }).sort({ createdAt: -1 });

    // Reset status for all borrowers if needed
    await Promise.all(borrowers.map(resetStatusIfNewDay));

    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all borrowers including cleared
exports.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find().sort({ createdAt: -1 });

    // Reset status for all borrowers if needed
    await Promise.all(borrowers.map(resetStatusIfNewDay));

    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single borrower by ID
exports.getBorrowerById = async (req, res) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    await resetStatusIfNewDay(borrower);

    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new borrower
exports.createBorrower = async (req, res) => {
  const { name, customerID, phone, dob, amount, email, refereeName, refereePhone } = req.body;

  if (!customerID) return res.status(400).json({ message: "customerID is required" });

  const borrowHistory = [];
  if (amount !== undefined && amount !== null) {
    borrowHistory.push({ amount });
  }

  const newBorrower = new Borrower({
    name,
    customerID,
    phone,
    dob,
    email,
    refereeName,
    refereePhone,
    balance: amount || 0,
    borrowHistory,
    totalTimesBorrowed: amount ? 1 : 0,
    tags: ["New"],
  });

  try {
    const savedBorrower = await newBorrower.save();
    res.status(201).json(savedBorrower);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.customerID) {
      return res.status(400).json({ message: "customerID already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

// Update borrower status (Called / Unreachable) or notes
exports.updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    if (status) {
      borrower.status = status;
      borrower.statusUpdatedAt = new Date(); // track status timestamp
    }

    if (notes !== undefined) borrower.notes = notes;

    await borrower.save();
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark repayment
exports.markRepayment = async (req, res) => {
  const { amountPaid } = req.body;

  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    borrower.balance -= amountPaid;

    if (borrower.borrowHistory.length > 0) {
      const lastBorrow = borrower.borrowHistory[borrower.borrowHistory.length - 1];
      if (borrower.balance <= 0) {
        lastBorrow.status = "Cleared";
        lastBorrow.dateCleared = new Date();
      }
    }

    await borrower.save();
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
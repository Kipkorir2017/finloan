const Borrower = require("../models/Borrower");

// Get all active borrowers (balance > 0)
exports.getActiveBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find({ balance: { $gt: 0 } })
      .sort({ createdAt: -1 });
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all borrowers including cleared
exports.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find().sort({ createdAt: -1 });
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
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new borrower
exports.createBorrower = async (req, res) => {
  const { name, phone, dob, amount, email, refereeName, refereePhone } = req.body;

  const newBorrower = new Borrower({
    name,
    phone,
    dob,
    email,
    refereeName,
    refereePhone,
    balance: amount,
    borrowHistory: [{ amount }],
    totalTimesBorrowed: 1,
    tags: ["New"],
  });

  try {
    const savedBorrower = await newBorrower.save();
    res.status(201).json(savedBorrower);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update borrower status (Called / Unreachable) or notes
exports.updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    if (status) borrower.status = status;
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

    // Update last active borrow entry
    const lastBorrow = borrower.borrowHistory[borrower.borrowHistory.length - 1];
    if (borrower.balance <= 0) {
      lastBorrow.status = "Cleared";
      lastBorrow.dateCleared = new Date();
    }

    await borrower.save();
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
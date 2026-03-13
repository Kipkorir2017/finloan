const Borrower = require("../models/Borrower");

// Get all borrowers
exports.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find().sort({ createdAt: -1 });
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single borrower by ID
exports.getBorrowerById = async (req, res) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new borrower
exports.createBorrower = async (req, res) => {
  const { name, phone, dob, amount, email, refereeName, refereePhone } = req.body;

  const newBorrower = new Borrower({
    name,
    phone,
    dob,
    amount,
    email,
    refereeName,
    refereePhone,
  });

  try {
    const savedBorrower = await newBorrower.save();
    res.status(201).json(savedBorrower);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update borrower status and notes
exports.updateBorrowerStatus = async (req, res) => {
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
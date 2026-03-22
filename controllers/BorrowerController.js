// const Borrower = require("../models/Borrower");

// // Helper: Reset status if it's a new day
// const resetStatusIfNewDay = async (borrower) => {
//   if (borrower.statusUpdatedAt) {
//     const lastUpdate = new Date(borrower.statusUpdatedAt);
//     const now = new Date();
//     if (
//       lastUpdate.getFullYear() !== now.getFullYear() ||
//       lastUpdate.getMonth() !== now.getMonth() ||
//       lastUpdate.getDate() !== now.getDate()
//     ) {
//       borrower.status = null;
//       borrower.statusUpdatedAt = null;
//       await borrower.save();
//     }
//   }
// };

// // GET all active borrowers (balance > 0)
// exports.getActiveBorrowers = async (req, res) => {
//   try {
//     const borrowers = await Borrower.find({ balance: { $gt: 0 } }).sort({ createdAt: -1 });
//     await Promise.all(borrowers.map(resetStatusIfNewDay));
//     res.json(borrowers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET all borrowers including cleared
// exports.getAllBorrowers = async (req, res) => {
//   try {
//     const borrowers = await Borrower.find().sort({ createdAt: -1 });
//     await Promise.all(borrowers.map(resetStatusIfNewDay));
//     res.json(borrowers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET borrower by ID
// exports.getBorrowerById = async (req, res) => {
//   try {
//     const borrower = await Borrower.findById(req.params.id);
//     if (!borrower) return res.status(404).json({ message: "Borrower not found" });
//     await resetStatusIfNewDay(borrower);
//     res.json(borrower);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // CREATE borrower
// exports.createBorrower = async (req, res) => {
//   const { name, customerID, phone, dob, amount, email, refereeName, refereePhone } = req.body;

//   if (!customerID) return res.status(400).json({ message: "customerID is required" });

//   const borrowHistory = [];
//   if (amount !== undefined && amount !== null) {
//     borrowHistory.push({ amount });
//   }

//   const newBorrower = new Borrower({
//     name,
//     customerID,
//     phone,
//     dob,
//     email,
//     refereeName,
//     refereePhone,
//     balance: amount || 0,
//     borrowHistory,
//     totalTimesBorrowed: amount ? 1 : 0,
//     tags: ["New"],
//     notes: "", // initialize empty comments
//   });

//   try {
//     const savedBorrower = await newBorrower.save();
//     res.status(201).json(savedBorrower);
//   } catch (err) {
//     if (err.code === 11000 && err.keyPattern.customerID) {
//       return res.status(400).json({ message: "customerID already exists" });
//     }
//     res.status(400).json({ message: err.message });
//   }
// };

// // UPDATE borrower status or notes
// exports.updateStatus = async (req, res) => {
//   const { status, notes } = req.body;
//   try {
//     const borrower = await Borrower.findById(req.params.id);
//     if (!borrower) return res.status(404).json({ message: "Borrower not found" });

//     if (status) {
//       borrower.status = status;
//       borrower.statusUpdatedAt = new Date();
//     }

//     if (notes !== undefined) borrower.notes = notes; // <-- update notes

//     await borrower.save();
//     res.json(borrower);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // MARK repayment
// exports.markRepayment = async (req, res) => {
//   const { amountPaid } = req.body;

//   try {
//     const borrower = await Borrower.findById(req.params.id);
//     if (!borrower) return res.status(404).json({ message: "Borrower not found" });

//     borrower.balance -= amountPaid;

//     if (borrower.borrowHistory.length > 0) {
//       const lastBorrow = borrower.borrowHistory[borrower.borrowHistory.length - 1];
//       if (borrower.balance <= 0) {
//         lastBorrow.status = "Cleared";
//         lastBorrow.dateCleared = new Date();
//       }
//     }

//     await borrower.save();
//     res.json(borrower);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



const Borrower = require("../models/Borrower");


exports.getActiveBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find({ balance: { $gt: 0 } }).sort({ createdAt: -1 });
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all borrowers including cleared
exports.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find().sort({ createdAt: -1 });
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET borrower by ID
exports.getBorrowerById = async (req, res) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE borrower
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
    notes: "",
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

// ✅ UPDATE borrower status or notes
exports.updateStatus = async (req, res) => {
  const { status, notes } = req.body;

  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    // Update status
    if (status) {
      borrower.status = status;
      borrower.statusUpdatedAt = new Date();
    }

    // Update notes
    if (notes !== undefined) {
      borrower.notes = notes;
    }

    const updatedBorrower = await borrower.save();
    res.json(updatedBorrower);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK repayment
exports.markRepayment = async (req, res) => {
  const { amountPaid } = req.body;

  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    borrower.balance -=Number(amountPaid); 

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
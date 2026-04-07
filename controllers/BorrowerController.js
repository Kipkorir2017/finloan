const Borrower = require("../models/Borrower");

// ================== HELPERS ==================
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getContactStatus = (loan) => {
  if (!loan.contactUpdatedAt) return loan.contactStatus;
  const now = new Date();
  const isExpired = now - new Date(loan.contactUpdatedAt) >= 24 * 60 * 60 * 1000;
  return isExpired ? null : loan.contactStatus;
};

const calculateDueDate = (termDays) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + termDays);
  return date;
};

const getInterestRate = (termDays) => {
  if (termDays === 7) return 0.15;
  if (termDays === 14) return 0.2;
  if (termDays === 30) return 0.25;
  return 0.25;
};

const calculateLoanBreakdown = (amount, termDays) => {
  const rate = getInterestRate(termDays);
  const interestAmount = amount * rate;
  const netDisbursed = amount - interestAmount;
  return { interestAmount, netDisbursed, rate };
};

const getLatestLoan = (borrower) => {
  return (
    borrower.borrowHistory.find((l) => l.status === "Pending") ||
    borrower.borrowHistory.find((l) => l.status === "Active") ||
    borrower.borrowHistory[borrower.borrowHistory.length - 1]
  );
};

// ================== LOAN FORMATTING ==================
const formatLoans = async (borrowers, filterFn) => {
  const results = [];
  const today = normalizeDate(new Date());

  for (const b of borrowers) {
    for (const loan of b.borrowHistory) {
      if (!loan.dueDate) continue;
      const dueDate = normalizeDate(loan.dueDate);

      if (filterFn(loan, dueDate, today)) {
        const totalRepaid = loan.repayments?.reduce((sum, r) => sum + r.amount, 0) || 0;

        // Add 10% penalty for overdue loans
        let totalDue = loan.amount + (loan.interest || 0);
        if (loan.status === "Active" && dueDate < today) {
          totalDue += totalDue * 0.1; // 10% default fee
        }

        results.push({
          borrowerId: b._id,
          name: b.name,
          phone: b.phone,
          amount: loan.amount,
          netDisbursed: loan.netDisbursed || 0,
          totalDue,
          totalRepaid,
          balanceRemaining: totalDue - totalRepaid,
          status: loan.status,
          contactStatus: getContactStatus(loan),
          dueDate,
          notes: loan.notes || [],
        });
      }
    }
  }

  return results;
};

// ================== BORROWER CRUD ==================

// CREATE BORROWER
exports.createBorrower = async (req, res) => {
  try {
    let { name, nationalId, phone, altPhoneNumber, location, refereeName, refereePhone, email, dob, amount, termDays, creditScore } = req.body;

    if (!name && req.body.firstName && req.body.lastName) {
      name = `${req.body.firstName} ${req.body.lastName}`;
    }

    if (!name || !nationalId || !phone) {
      return res.status(400).json({ message: "name, nationalId and phone are required" });
    }

    const existingActiveLoan = await Borrower.findOne({
      nationalId,
      "borrowHistory.status": { $ne: "Cleared" },
    });

    if (existingActiveLoan) {
      return res.status(400).json({ message: "Borrower already has an uncleared loan" });
    }

    const borrowHistory = [];

    if (amount) {
      if (!termDays) return res.status(400).json({ message: "termDays is required" });

      const dueDate = calculateDueDate(termDays);
      const { interestAmount, netDisbursed, rate } = calculateLoanBreakdown(amount, termDays);

      borrowHistory.push({
        amount,
        dueDate,
        interest: interestAmount,
        interestRate: rate,
        netDisbursed,
        status: "Pending",
        contactStatus: null,
        contactUpdatedAt: null,
        repayments: [],
        notes: [
          { text: `Loan requested: ${amount}, Net: ${netDisbursed}`, date: new Date(), agent: "System" },
        ],
      });
    }

    const borrower = new Borrower({
      name,
      nationalId,
      phone,
      altPhoneNumber,
      location,
      refereeName,
      refereePhone,
      email,
      dob,
      balance: amount || 0,
      borrowHistory,
      totalTimesBorrowed: amount ? 1 : 0,
      tags: ["New"],
      notes: [],
      creditScore: creditScore || 700,
    });

    const saved = await borrower.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL BORROWERS
exports.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BORROWER BY ID
exports.getBorrowerById = async (req, res) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== LOAN VIEWS ==================

// GET ACTIVE LOANS (not yet due)
exports.getActiveLoans = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    const today = normalizeDate(new Date());
    const activeLoans = await formatLoans(
      borrowers,
      (loan, dueDate) => loan.status === "Active" && dueDate > today
    );
    res.json(activeLoans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET DUE LOANS (due today)
exports.getDueLoans = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    const today = normalizeDate(new Date());
    const dueLoans = await formatLoans(
      borrowers,
      (loan, dueDate) => loan.status === "Active" && dueDate.getTime() === today.getTime()
    );
    res.json(dueLoans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET OVERDUE LOANS (past due)
exports.getOverdueLoans = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    const today = normalizeDate(new Date());
    const overdueLoans = await formatLoans(
      borrowers,
      (loan, dueDate) => loan.status === "Active" && dueDate < today
    );
    res.json(overdueLoans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== BORROWER ACTIONS ==================

// UPDATE CONTACT STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const loan = getLatestLoan(borrower);
    if (!loan) return res.status(400).json({ message: "No loan found" });

    if (status) {
      loan.contactStatus = status;
      loan.contactUpdatedAt = new Date();
    }

    if (note?.text) {
      loan.notes.push({ text: note.text, date: new Date(), agent: req.user?.name || "System" });
    }

    await borrower.save();
    res.json({ message: "Updated", borrower });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK REPAYMENT
exports.markRepayment = async (req, res) => {
  try {
    const { amountPaid } = req.body;
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const loan = getLatestLoan(borrower);
    if (!loan) return res.status(400).json({ message: "No loan found" });

    loan.repayments = loan.repayments || [];
    loan.repayments.push({ amount: Number(amountPaid), date: new Date() });

    let totalDue = loan.amount + (loan.interest || 0);
    const today = normalizeDate(new Date());
    const dueDate = normalizeDate(loan.dueDate);

    // Apply 10% penalty if overdue
    if (loan.status === "Active" && dueDate < today) {
      totalDue += totalDue * 0.1;
    }

    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);

    if (totalRepaid >= totalDue) {
      loan.status = "Cleared";
      loan.dateCleared = new Date();
      borrower.balance = 0;
    } else {
      borrower.balance = totalDue - totalRepaid;
    }

    loan.notes.push({ text: `Repayment: ${amountPaid}`, date: new Date(), agent: "System" });

    await borrower.save();
    res.json({ borrower, balanceRemaining: borrower.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== APPROVE / REJECT ==================
exports.approveLoan = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admin can approve loans" });

    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const loan = getLatestLoan(borrower);
    if (!loan) return res.status(400).json({ message: "No loan found" });

    loan.status = "Active";
    loan.notes.push({ text: "Loan approved", date: new Date(), agent: req.user?.name || "System" });

    await borrower.save();
    res.json({ message: "Loan approved successfully", borrower });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admin can reject loans" });

    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const loan = getLatestLoan(borrower);
    if (!loan) return res.status(400).json({ message: "No loan found" });

    loan.status = "Rejected";
    loan.notes.push({ text: "Loan rejected", date: new Date(), agent: req.user?.name || "System" });

    await borrower.save();
    res.json({ message: "Loan rejected", borrower });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RISK ASSESSMENT 
exports.getRiskCustomers = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    const today = normalizeDate(new Date());

    const riskCustomers = [];
    const overdueCustomers = [];

    borrowers.forEach((b) => {
      let hasOverdueLoan = false;
      let hasLatePastLoan = false;
      let lowCreditScore = false;

      b.borrowHistory?.forEach((loan) => {
        const dueDate = normalizeDate(loan.dueDate);
        if (loan.status === "Active" && dueDate < today) hasOverdueLoan = true;

        if (loan.status === "Cleared" && loan.repayments?.length) {
          const lastRepaymentDate = loan.repayments[loan.repayments.length - 1]?.date;
          if (lastRepaymentDate && new Date(lastRepaymentDate) > new Date(loan.dueDate)) {
            hasLatePastLoan = true;
          }
        }
      });

      if (b.creditScore && b.creditScore < 600) lowCreditScore = true;

      if (hasOverdueLoan && hasLatePastLoan && lowCreditScore) {
        riskCustomers.push({
          _id: b._id,
          name: b.name,
          phone: b.phone,
          balance: b.balance,
          creditScore: b.creditScore,
          overdue: true,
        });
      } else if (hasOverdueLoan) {
        overdueCustomers.push({
          _id: b._id,
          name: b.name,
          phone: b.phone,
          balance: b.balance,
          creditScore: b.creditScore,
          overdue: true,
        });
      }
    });

    res.json({ riskCustomers, overdueCustomers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
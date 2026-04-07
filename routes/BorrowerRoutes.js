const express = require("express");
const router = express.Router();
const borrowerController = require("../controllers/BorrowerController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Loan views
router.get("/loans/active", borrowerController.getActiveLoans);
router.get("/loans/due", borrowerController.getDueLoans);
router.get("/loans/overdue", borrowerController.getOverdueLoans);

// Borrower CRUD
router.post("/", borrowerController.createBorrower);
router.get("/", borrowerController.getAllBorrowers);
router.get("/risk", borrowerController.getRiskCustomers);
router.get("/:id", borrowerController.getBorrowerById);

// Actions
router.put("/:id/contact-status", borrowerController.updateStatus);
router.put("/:id/repayment", borrowerController.markRepayment);

// Approve / Reject loans (Admin only)
router.put("/:id/approve", authMiddleware, authorize("admin"), borrowerController.approveLoan);
router.put("/:id/reject", authMiddleware, authorize("admin"), borrowerController.rejectLoan);

module.exports = router;
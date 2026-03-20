const express = require("express");
const router = express.Router();
const borrowerController = require("../controllers/BorrowerController");

// Active borrowers
router.get("/active", borrowerController.getActiveBorrowers);

// All borrowers
router.get("/", borrowerController.getAllBorrowers);

// Single borrower
router.get("/:id", borrowerController.getBorrowerById);

// Create borrower
router.post("/", borrowerController.createBorrower);

// Update status / notes
// router.patch("/:id/status", borrowerController.updateStatus);
router.put("/:id", borrowerController.updateStatus);

// Mark repayment
router.patch("/:id/repay", borrowerController.markRepayment);

module.exports = router;
const express = require("express");
const router = express.Router();
const borrowerController = require("../controllers/borrowerController");

// Get all borrowers
router.get("/", borrowerController.getAllBorrowers);

// Get single borrower by ID
router.get("/:id", borrowerController.getBorrowerById);

// Add new borrower
router.post("/", borrowerController.createBorrower);

// Update status and notes
router.patch("/:id", borrowerController.updateBorrowerStatus);

module.exports = router;
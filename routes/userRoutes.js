const express = require("express");
const router = express.Router();

const { createUser, getUsers, changeRole, deleteUser } = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// CREATE USER (Admin only)
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin"),
  createUser
);

// GET ALL USERS (Admin only)
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);

// UPDATE USER ROLE (Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  changeRole
);

// DELETE USER (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

module.exports = router;
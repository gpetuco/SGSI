const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const {
  retornaUsuariosData,
  getUsuarioUniqueId,
  deleteUser,
} = require("../controllers/usuario");

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, retornaUsuariosData); // Get all users (Admin only)
router.get("/:id", protect, getUsuarioUniqueId); // Get a specific user

module.exports = router;

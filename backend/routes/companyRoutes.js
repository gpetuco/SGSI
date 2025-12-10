const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { createCompany, getCompanies } = require("../controllers/cliente");

const router = express.Router();

// Companies (Admin only)
router.get("/", protect, adminOnly, getCompanies);
router.post("/", protect, adminOnly, createCompany);

module.exports = router;

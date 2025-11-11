const Company = require("../models/Company");

// @desc    Create a new company (Admin only)
// @route   POST /api/companies
// @access  Private (Admin)
const createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Nome da empresa é obrigatório" });
    }

    const company = await Company.create({ name: name.trim() });

    return res.status(201).json(company);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all companies (Admin only)
// @route   GET /api/companies
// @access  Private (Admin)
const getCompanies = async (_req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });
    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createCompany, getCompanies };


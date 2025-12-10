const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getDashboardData,
  getDashboardClienteData,
  getAcaoById,
  getAcoes,
  criarAcao,
  updateAcao,
  deleteAcao,
  updateAcaoStatus,
  updateAcaoChecklist,
} = require("../controllers/acao");

const router = express.Router();

// Acao Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getDashboardClienteData);
router.get("/", protect, getAcoes); // Get all acoes (Admin: all, User: assigned)
router.get("/:id", protect, getAcaoById); // Get acao by ID
router.post("/", protect, adminOnly, criarAcao); // Create a acao (Admin only)
router.put("/:id", protect, updateAcao); // Update acao details
router.delete("/:id", protect, adminOnly, deleteAcao); // Delete a acao (Admin only)
router.put("/:id/status", protect, updateAcaoStatus); // Update acao status
router.put("/:id/todo", protect, updateAcaoChecklist); // Update acao checklist

module.exports = router;

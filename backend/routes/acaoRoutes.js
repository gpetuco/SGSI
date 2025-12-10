const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getDashboardData,
  getDashboardClienteData,
  getAcaoUnique,
  getAcoes,
  criarAcao,
  updateAcao,
  deleteAcao,
  updateAcaoStatus,
  updateAcaoChecklist,
} = require("../controllers/acao");

const router = express.Router();

router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getDashboardClienteData);
router.get("/", protect, getAcoes);
router.get("/:id", protect, getAcaoUnique);
router.post("/", protect, adminOnly, criarAcao);
router.put("/:id", protect, updateAcao);
router.delete("/:id", protect, adminOnly, deleteAcao);
router.put("/:id/status", protect, updateAcaoStatus);
router.put("/:id/todo", protect, updateAcaoChecklist);

module.exports = router;

const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  updateAcao,
  getAcoes,
  deleteAcao,
  updateAcaoChecklist,
  getDashboardClienteData,
  criarAcao,
  getAcaoUnique,
  updateAcaoStatus,
  getDashboardData,
} = require("../controllers/acao");

const router = express.Router();

router.get("/user-dashboard-data", protect, getDashboardClienteData);
router.get("/dashboard-data", protect, getDashboardData);
router.get("/", protect, getAcoes);
router.post("/", protect, adminOnly, criarAcao);
router.get("/:id", protect, getAcaoUnique);
router.put("/:id/status", protect, updateAcaoStatus);
router.put("/:id/todo", protect, updateAcaoChecklist);
router.put("/:id", protect, updateAcao);
router.delete("/:id", protect, adminOnly, deleteAcao);

module.exports = router;

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

router.put("/:id/status", protect, updateAcaoStatus);
router.get("/:id", protect, getAcaoUnique);
router.post("/", protect, adminOnly, criarAcao);
router.get("/user-dashboard-data", protect, getDashboardClienteData);
router.delete("/:id", protect, adminOnly, deleteAcao);
router.put("/:id/todo", protect, updateAcaoChecklist);
router.get("/", protect, getAcoes);
router.get("/dashboard-data", protect, getDashboardData);
router.put("/:id", protect, updateAcao);

module.exports = router;

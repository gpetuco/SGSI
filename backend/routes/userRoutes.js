const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const {
  retornaUsuariosData,
  getUsuarioUniqueId,
} = require("../controllers/usuario");

const router = express.Router();

router.get("/", protect, adminOnly, retornaUsuariosData);
router.get("/:id", protect, getUsuarioUniqueId);

module.exports = router;

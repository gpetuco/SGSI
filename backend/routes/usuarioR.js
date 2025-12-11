const express = require("express");
const { privateEmpresaSec, protect } = require("../guards/autenticacaoGuard");
const {
  retornaUsuariosData,
  getUsuarioUniqueId,
} = require("../controllers/usuario");

const router = express.Router();

router.get("/", protect, privateEmpresaSec, retornaUsuariosData);
router.get("/:id", protect, getUsuarioUniqueId);

module.exports = router;

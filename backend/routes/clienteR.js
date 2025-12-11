const express = require("express");
const { protect, privateEmpresaSec } = require("../guards/autenticacaoGuard");
const { criarCliente, getClientes } = require("../controllers/cliente");

const router = express.Router();

router.get("/", protect, privateEmpresaSec, getClientes);
router.post("/", protect, privateEmpresaSec, criarCliente);

module.exports = router;

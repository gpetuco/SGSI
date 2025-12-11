const express = require("express");
const { criarCliente, getClientes } = require("../controllers/cliente");
const { protect, privateEmpresaSec } = require("../guards/autenticacaoGuard");

const router = express.Router();

router.post("/", protect, privateEmpresaSec, criarCliente);
router.get("/", protect, privateEmpresaSec, getClientes);

module.exports = router;

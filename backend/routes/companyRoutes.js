const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { criarCliente, getClientes } = require("../controllers/cliente");

const router = express.Router();

router.get("/", protect, adminOnly, getClientes);
router.post("/", protect, adminOnly, criarCliente);

module.exports = router;

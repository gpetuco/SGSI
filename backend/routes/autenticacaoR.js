const express = require("express");
const {
  cadastroUsuario,
  login,
  getDadosUsuario,
  editarDadosUsuario,
} = require("../controllers/autenticacao");
const { protect } = require("../guards/autenticacaoGuard");
const upload = require("../guards/abrirArquivoGuard");

const router = express.Router();

router.post("/register", cadastroUsuario);
router.post("/login", login);
router.get("/profile", protect, getDadosUsuario);
router.put("/profile", protect, editarDadosUsuario);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum arquivo enviado." });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
});

module.exports = router;

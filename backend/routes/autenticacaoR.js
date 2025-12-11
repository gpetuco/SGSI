const upload = require("../guards/abrirArquivoGuard");
const { protect } = require("../guards/autenticacaoGuard");
const {
  editarDadosUsuario,
  login,
  cadastroUsuario,
  getDadosUsuario,
} = require("../controllers/autenticacao");
const express = require("express");
const router = express.Router();

router.post("/login", login);
router.get("/profile", protect, getDadosUsuario);
router.post("/register", cadastroUsuario);
router.put("/profile", protect, editarDadosUsuario);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum arquivo enviado." });
  }
  const fotoAdd = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ fotoAdd });
});

module.exports = router;

const multer = require("multer");

const filtroDeArquivo = (req, file, cb) => {
  const tipos = ["image/jpeg", "image/png", "image/jpg"];
  if (tipos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas .jpg, .png e .jpeg!"), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, filtroDeArquivo });

module.exports = upload;

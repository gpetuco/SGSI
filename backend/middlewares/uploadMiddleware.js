const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const tipos = ["image/jpeg", "image/png", "image/jpg"];
  if (tipos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas .jpg, .png e .jpeg!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

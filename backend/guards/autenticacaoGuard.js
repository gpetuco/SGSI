const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      res.status(401).json({ message: "Sem token, nao autorizado" });
    }
  } catch (error) {
    res.status(401).json({ message: "Erro no token", error: error.message });
  }
};

const privateEmpresaSec = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Nao autorizado" });
  }
};

module.exports = { protect, privateEmpresaSec };

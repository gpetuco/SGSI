const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

////////////////////////////////////////////
const User = require("../models/User");

const tokenUsuario = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS, { expiresIn: "7d" });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    res.json({
      _id: usuario._id,
      name: usuario.name,
      email: usuario.email,
      empresa: usuario.empresa,
      profileImageUrl: usuario.profileImageUrl,
      role: usuario.role,
      token: tokenUsuario(usuario._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const cadastroUsuario = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profileImageUrl,
      adminInviteToken,
      empresaId,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Usuário já existente." });
    }

    let role = "member";
    let empresa = null;

    if (empresaId) {
      const Company = require("../models/Company");
      const company = await Company.findById(empresaId);
      if (!company) {
        return res.status(400).json({ message: "Empresa inválida" });
      }
      empresa = company._id;
    } else if (
      adminInviteToken &&
      adminInviteToken == process.env.TOKEN_ADMIN
    ) {
      role = "admin";
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCrypt = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: senhaCrypt,
      profileImageUrl,
      role,
      empresa,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      empresa: user.empresa,
      profileImageUrl: user.profileImageUrl,
      token: tokenUsuario(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const getDadosUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const editarDadosUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    usuario.name = req.body.name || usuario.name;
    usuario.email = req.body.email || usuario.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(req.body.password, salt);
    }

    const atualizado = await usuario.save();

    res.json({
      _id: atualizado._id,
      name: atualizado.name,
      email: atualizado.email,
      role: atualizado.role,
      token: tokenUsuario(atualizado._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

module.exports = {
  cadastroUsuario,
  login,
  getDadosUsuario,
  editarDadosUsuario,
};

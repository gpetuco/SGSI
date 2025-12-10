const bcrypt = require("bcryptjs");

////////////////

const User = require("../models/User");
const Acao = require("../models/Acao");

const retornaUsuariosData = async (req, res) => {
  try {
    const usuarios = await User.find({ role: "admin" }).select("-password");

    const usuariosComAcao = await Promise.all(
      usuarios.map(async (usuario) => {
        const acoesPendentes = await Acao.countDocuments({
          responsavel: usuario._id,
          status: "Pendente",
        });
        const acoesEmAndamento = await Acao.countDocuments({
          responsavel: usuario._id,
          status: "Em Andamento",
        });
        const acoesConcluidas = await Acao.countDocuments({
          responsavel: usuario._id,
          status: "Concluído",
        });

        return {
          ...usuario._doc,
          acoesPendentes,
          acoesEmAndamento,
          acoesConcluidas,
        };
      })
    );

    res.json(usuariosComAcao);
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const getUsuarioUniqueId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select("-password");
    if (!usuario)
      return res.status(404).json({ message: "Usuário não encontrado." });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

module.exports = { retornaUsuariosData, getUsuarioUniqueId };

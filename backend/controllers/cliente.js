const Company = require("../models/Company");

const criarCliente = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Nome da empresa é obrigatório" });
    }

    const cliente = await Company.create({ name: name.trim() });

    return res.status(201).json(cliente);
  } catch (error) {
    return res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const getClientes = async (_req, res) => {
  try {
    const clientes = await Company.find({}).sort({ createdAt: -1 });
    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

module.exports = { criarCliente, getClientes };

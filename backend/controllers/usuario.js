const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get all users (Admin only)
// @route   GET /api/users/
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "admin" }).select("-password");

    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const acoesPendentes = await Task.countDocuments({
          responsavel: user._id,
          status: "Pendente",
        });
        const inProgressTasks = await Task.countDocuments({
          responsavel: user._id,
          status: "In Progress",
        });
        const acoesConcluidas = await Task.countDocuments({
          responsavel: user._id,
          status: "Concluído",
        });

        return {
          ...user._doc,
          acoesPendentes,
          inProgressTasks,
          acoesConcluidas,
        };
      })
    );

    res.json(usersWithTaskCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

module.exports = { getUsers, getUserById };

const Task = require("../models/Task");

// @desc    Get all tasks
// @route   GET /api/tasks/
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, responsavel, classification, cliente } = req.query;
    const isAdmin = req.user.role === "admin";
    const restrictToMe = responsavel === "me";

    let baseFilter = {};

    if (status) {
      baseFilter.status = status;
    }
    if (classification) {
      baseFilter.classification = classification;
    }

    if (isAdmin) {
      if (cliente) {
        baseFilter.cliente = cliente;
      }
      if (responsavel && !restrictToMe) {
        baseFilter.responsavel = responsavel;
      }
    } else {
      if (!req.user.empresa) {
        return res.json({
          tasks: [],
          statusSummary: {
            all: 0,
            acoesPendentes: 0,
            acoesEmAndamento: 0,
            acoesConcluidas: 0,
          },
        });
      }

      baseFilter.cliente = req.user.empresa;

      if (restrictToMe) {
        baseFilter.responsavel = req.user._id;
      } else if (responsavel && responsavel !== "me") {
        baseFilter.responsavel = responsavel;
      }
    }

    const listFilter = {
      ...baseFilter,
      ...(isAdmin && restrictToMe ? { responsavel: req.user._id } : {}),
    };

    let tasks = await Task.find(listFilter)
      .populate("responsavel", "name email profileImageUrl")
      .populate("cliente", "name");

    tasks = await Promise.all(
      tasks.map(async (task) => {
        const total = Array.isArray(task.itens) ? task.itens.length : 0;
        const concluidoCount = Array.isArray(task.itens)
          ? task.itens.filter((item) => item.concluido).length
          : 0;
        const progressPct =
          total > 0
            ? Math.round((concluidoCount / total) * 100)
            : task.progress || 0;
        return {
          ...task._doc,
          concluidoTodoCount: concluidoCount,
          progress: progressPct,
        };
      })
    );

    const summaryBaseFilter = {
      ...baseFilter,
      ...(isAdmin && restrictToMe ? { responsavel: req.user._id } : {}),
    };

    const allTasks = await Task.countDocuments(summaryBaseFilter);

    const acoesPendentes = await Task.countDocuments({
      ...summaryBaseFilter,
      status: "Pendente",
    });

    const acoesEmAndamento = await Task.countDocuments({
      ...summaryBaseFilter,
      status: "Em Andamento",
    });

    const acoesConcluidas = await Task.countDocuments({
      ...summaryBaseFilter,
      status: "Concluído",
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        acoesPendentes,
        acoesEmAndamento,
        acoesConcluidas,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("responsavel", "name email profileImageUrl")
      .populate("cliente", "name");

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const taskClienteId = task.cliente
        ? task.cliente._id?.toString() || task.cliente.toString()
        : null;

      if (!userEmpresaId || !taskClienteId || userEmpresaId !== taskClienteId) {
        return res.status(403).json({ message: "Acesso negado!" });
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks/
// @access  Private (Admin)
const criarAcao = async (req, res) => {
  try {
    const {
      title,
      descricao,
      prioridade,
      classification,
      dueDate,
      responsavel,
      itens,
      cliente,
    } = req.body;

    if (!Array.isArray(responsavel)) {
      return res
        .status(400)
        .json({ message: "responsavel must be an array of user IDs" });
    }

    let clienteId = null;
    if (cliente) {
      try {
        const Company = require("../models/Company");
        const comp = await Company.findById(cliente);
        if (!comp) return res.status(400).json({ message: "Cliente inválido" });
        clienteId = comp._id;
      } catch (_) {
        return res.status(400).json({ message: "Cliente inválido" });
      }
    }

    const task = await Task.create({
      title,
      descricao,
      prioridade,
      classification,
      dueDate,
      responsavel,
      createdBy: req.user._id,
      itens,
      cliente: clienteId,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = req.body.title || task.title;
    task.descricao = req.body.descricao || task.descricao;
    task.prioridade = req.body.prioridade || task.prioridade;
    task.classification = req.body.classification || task.classification;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.itens = req.body.itens || task.itens;
    if (Object.prototype.hasOwnProperty.call(req.body, "cliente")) {
      if (!req.body.cliente) {
        task.cliente = null;
      } else {
        try {
          const Company = require("../models/Company");
          const comp = await Company.findById(req.body.cliente);
          if (!comp)
            return res.status(400).json({ message: "Cliente inválido" });
          task.cliente = comp._id;
        } catch (_) {
          return res.status(400).json({ message: "Cliente inválido" });
        }
      }
    }

    if (req.body.responsavel) {
      if (!Array.isArray(req.body.responsavel)) {
        return res
          .status(400)
          .json({ message: "responsavel must be an array of user IDs" });
      }
      task.responsavel = req.body.responsavel;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const taskClienteId = task.cliente ? task.cliente.toString() : null;

      if (!userEmpresaId || !taskClienteId || userEmpresaId !== taskClienteId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const isAssigned = task.responsavel.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newStatus = req.body.status || task.status;
    const prevStatus = task.status;
    task.status = newStatus;

    if (task.status === "Concluído") {
      task.itens.forEach((item) => (item.concluido = true));
      task.progress = 100;
      if (!task.concluidoAt) task.concluidoAt = new Date();
    } else {
      if (prevStatus === "Concluído") task.concluidoAt = undefined;
    }

    await task.save();
    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task checklist
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { itens } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const taskClienteId = task.cliente ? task.cliente.toString() : null;

      if (!userEmpresaId || !taskClienteId || userEmpresaId !== taskClienteId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update checklist" });
      }
    }

    if (!task.responsavel.includes(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update checklist" });
    }

    task.itens = itens;

    const concluidoCount = task.itens.filter((item) => item.concluido).length;
    const totalItems = task.itens.length;
    task.progress =
      totalItems > 0 ? Math.round((concluidoCount / totalItems) * 100) : 0;

    if (totalItems === 0) {
    } else if (concluidoCount === 0) {
      task.status = "Pendente";
      if (task.concluidoAt) task.concluidoAt = undefined;
    } else if (concluidoCount === totalItems) {
      task.status = "Concluído";
      if (!task.concluidoAt) task.concluidoAt = new Date();
    } else {
      task.status = "Em Andamento";
      if (task.concluidoAt) task.concluidoAt = undefined;
    }

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "responsavel",
      "name email profileImageUrl"
    );

    res.json({ message: "Task checklist updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard Data (Admin only)
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const { classification, startDate, endDate, cliente } = req.query;
    const isAdmin = req.user.role === "admin";

    const baseMatch = {};
    if (classification) baseMatch.classification = classification;
    if (startDate || endDate) {
      baseMatch.createdAt = {};
      if (startDate) baseMatch.createdAt.$gte = new Date(startDate);
      if (endDate) baseMatch.createdAt.$lte = new Date(endDate);
    }

    if (isAdmin) {
      if (cliente) {
        baseMatch.cliente = cliente;
      }
    } else {
      if (!req.user.empresa) {
        return res.status(200).json({
          statistics: {
            totalTasks: 0,
            acoesPendentes: 0,
            acoesConcluidas: 0,
            overdueTasks: 0,
            onTimeRate: 0,
          },
          charts: {
            taskDistribution: {
              All: 0,
              Pendente: 0,
              EmAndamento: 0,
              Concluído: 0,
            },
            taskPrioridadeLevels: {
              Low: 0,
              Medium: 0,
              High: 0,
            },
            statusByFramework: {},
            completionByFramework: [],
            completionByNistFunction: [],
            completionByIsoControlType: [],
            tasksByUser: [],
          },
          recentTasks: [],
        });
      }
      baseMatch.cliente = req.user.empresa;
    }

    const totalTasks = await Task.countDocuments(baseMatch);
    const acoesPendentes = await Task.countDocuments({
      ...baseMatch,
      status: "Pendente",
    });
    const acoesConcluidas = await Task.countDocuments({
      ...baseMatch,
      status: "Concluído",
    });
    const overdueTasks = await Task.countDocuments({
      ...baseMatch,
      status: { $ne: "Concluído" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pendente", "Em Andamento", "Concluído"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((i) => i._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];
    const taskPrioridadeLevelsRaw = await Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$prioridade", count: { $sum: 1 } } },
    ]);
    const taskPrioridadeLevels = taskPriorities.reduce((acc, prioridade) => {
      acc[prioridade] =
        taskPrioridadeLevelsRaw.find((i) => i._id === prioridade)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status prioridade classification dueDate createdAt responsavel"
      )
      .populate("responsavel", "name profileImageUrl");

    const frameworks = ["NIST CSF", "ISO 27001"];
    const statusByFrameworkRaw = await Task.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { classification: "$classification", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);
    const statusByFramework = frameworks.reduce((acc, fw) => {
      const bucket = { Pendente: 0, EmAndamento: 0, Concluído: 0 };
      taskStatuses.forEach((st) => {
        const f = statusByFrameworkRaw.find(
          (r) => r._id.classification === fw && r._id.status === st
        );
        if (f) {
          const key = st === "Em Andamento" ? "EmAndamento" : st;
          bucket[key] = f.count;
        }
      });
      acc[fw] = bucket;
      return acc;
    }, {});

    const completionByFrameworkAgg = await Task.aggregate([
      { $match: baseMatch },
      {
        $addFields: {
          totalTodos: { $size: { $ifNull: ["$itens", []] } },
          doneTodos: {
            $size: {
              $filter: {
                input: { $ifNull: ["$itens", []] },
                as: "t",
                cond: { $eq: ["$$t.concluido", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          classification: 1,
          progress: {
            $cond: [
              { $gt: ["$totalTodos", 0] },
              { $multiply: [{ $divide: ["$doneTodos", "$totalTodos"] }, 100] },
              {
                $cond: [
                  { $eq: ["$status", "Concluído"] },
                  100,
                  { $ifNull: ["$progress", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$classification",
          avgProgress: { $avg: "$progress" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          framework: "$_id",
          percent: { $round: ["$avgProgress", 0] },
          total: 1,
        },
      },
    ]);
    const completionByFramework = frameworks.map((fw) => {
      const row = completionByFrameworkAgg.find((i) => i.framework === fw);
      return { framework: fw, percent: row ? row.percent : 0 };
    });

    const nistMatch = { ...baseMatch, classification: "NIST CSF" };
    const completionByNistFunctionAgg = await Task.aggregate([
      { $match: nistMatch },
      {
        $addFields: {
          totalTodos: { $size: { $ifNull: ["$itens", []] } },
          doneTodos: {
            $size: {
              $filter: {
                input: { $ifNull: ["$itens", []] },
                as: "t",
                cond: { $eq: ["$$t.concluido", true] },
              },
            },
          },
          nistFunction: {
            $switch: {
              branches: [
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^GOVERN/i,
                    },
                  },
                  then: "Govern",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^IDENTIFY/i,
                    },
                  },
                  then: "Identify",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^PROTECT/i,
                    },
                  },
                  then: "Protect",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^DETECT/i,
                    },
                  },
                  then: "Detect",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^RESPOND/i,
                    },
                  },
                  then: "Respond",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^RECOVER/i,
                    },
                  },
                  then: "Recover",
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          nistFunction: 1,
          progress: {
            $cond: [
              { $gt: ["$totalTodos", 0] },
              { $multiply: [{ $divide: ["$doneTodos", "$totalTodos"] }, 100] },
              {
                $cond: [
                  { $eq: ["$status", "Concluído"] },
                  100,
                  { $ifNull: ["$progress", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$nistFunction",
          avgProgress: { $avg: "$progress" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          func: "$_id",
          percent: { $round: ["$avgProgress", 0] },
          total: 1,
        },
      },
    ]);

    const nistFunctionsOrder = [
      "Govern",
      "Identify",
      "Protect",
      "Detect",
      "Respond",
      "Recover",
    ];

    const completionByNistFunction = nistFunctionsOrder.map((fn) => {
      const row = completionByNistFunctionAgg.find((i) => i.func === fn);
      return {
        function: fn,
        percent: row ? row.percent : 0,
        total: row ? row.total : 0,
      };
    });

    const isoMatch = { ...baseMatch, classification: "ISO 27001" };
    const completionByIsoControlTypeAgg = await Task.aggregate([
      { $match: isoMatch },
      {
        $addFields: {
          totalTodos: { $size: { $ifNull: ["$itens", []] } },
          doneTodos: {
            $size: {
              $filter: {
                input: { $ifNull: ["$itens", []] },
                as: "t",
                cond: { $eq: ["$$t.concluido", true] },
              },
            },
          },
          isoType: {
            $switch: {
              branches: [
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^Organisational Controls/i,
                    },
                  },
                  then: "Organisational",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^People Controls/i,
                    },
                  },
                  then: "People",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^Physical Controls/i,
                    },
                  },
                  then: "Physical",
                },
                {
                  case: {
                    $regexMatch: {
                      input: "$title",
                      regex: /^Technological Controls/i,
                    },
                  },
                  then: "Technological",
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          isoType: 1,
          progress: {
            $cond: [
              { $gt: ["$totalTodos", 0] },
              { $multiply: [{ $divide: ["$doneTodos", "$totalTodos"] }, 100] },
              {
                $cond: [
                  { $eq: ["$status", "Concluído"] },
                  100,
                  { $ifNull: ["$progress", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$isoType",
          avgProgress: { $avg: "$progress" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          percent: { $round: ["$avgProgress", 0] },
          total: 1,
        },
      },
    ]);

    const isoControlTypesOrder = [
      "Organisational",
      "People",
      "Physical",
      "Technological",
    ];

    const completionByIsoControlType = isoControlTypesOrder.map((t) => {
      const row = completionByIsoControlTypeAgg.find((i) => i.type === t);
      return {
        type: t,
        percent: row ? row.percent : 0,
        total: row ? row.total : 0,
      };
    });

    const concluidoInScope = await Task.find({
      ...baseMatch,
      status: "Concluído",
    }).select("concluidoAt dueDate");
    const onTime = concluidoInScope.filter(
      (t) => t.concluidoAt && t.dueDate && t.concluidoAt <= t.dueDate
    ).length;
    const onTimeRate =
      concluidoInScope.length > 0
        ? Math.round((onTime / concluidoInScope.length) * 100)
        : 0;

    const tasksByUserAgg = await Task.aggregate([
      { $match: baseMatch },
      { $unwind: "$responsavel" },
      {
        $group: {
          _id: "$responsavel",
          Pendente: {
            $sum: { $cond: [{ $eq: ["$status", "Pendente"] }, 1, 0] },
          },
          EmAndamento: {
            $sum: { $cond: [{ $eq: ["$status", "Em Andamento"] }, 1, 0] },
          },
          Concluído: {
            $sum: { $cond: [{ $eq: ["$status", "Concluído"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          total: { $add: ["$Pendente", "$EmAndamento", "$Concluído"] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      {
        $addFields: {
          user: {
            $ifNull: [{ $arrayElemAt: ["$userDoc.name", 0] }, "Unknown"],
          },
        },
      },
      { $project: { userDoc: 0 } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          user: 1,
          Pendente: 1,
          EmAndamento: 1,
          Concluído: 1,
          total: 1,
        },
      },
    ]);

    res.status(200).json({
      statistics: {
        totalTasks,
        acoesPendentes,
        acoesConcluidas,
        overdueTasks,
        onTimeRate,
      },
      charts: {
        taskDistribution,
        taskPrioridadeLevels,
        statusByFramework,
        completionByFramework,
        completionByNistFunction,
        completionByIsoControlType,
        tasksByUser: tasksByUserAgg,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard Data (User-specific)
// @route   GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const empresaId = req.user.empresa || null;

    const baseMatch = empresaId
      ? { responsavel: userId, cliente: empresaId }
      : { responsavel: userId };

    const totalTasks = await Task.countDocuments(baseMatch);
    const acoesPendentes = await Task.countDocuments({
      ...baseMatch,
      status: "Pendente",
    });
    const acoesConcluidas = await Task.countDocuments({
      ...baseMatch,
      status: "Concluído",
    });
    const overdueTasks = await Task.countDocuments({
      ...baseMatch,
      status: { $ne: "Concluído" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pendente", "Em Andamento", "Concluído"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];
    const taskPrioridadeLevelsRaw = await Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$prioridade", count: { $sum: 1 } } },
    ]);

    const taskPrioridadeLevels = taskPriorities.reduce((acc, prioridade) => {
      acc[prioridade] =
        taskPrioridadeLevelsRaw.find((item) => item._id === prioridade)
          ?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status prioridade classification dueDate createdAt responsavel"
      )
      .populate("responsavel", "name profileImageUrl");

    res.status(200).json({
      statistics: {
        totalTasks,
        acoesPendentes,
        acoesConcluidas,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPrioridadeLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  criarAcao,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};

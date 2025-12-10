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
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0,
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
        const completedCount = Array.isArray(task.itens)
          ? task.itens.filter((item) => item.completed).length
          : 0;
        const progressPct =
          total > 0
            ? Math.round((completedCount / total) * 100)
            : task.progress || 0;
        return {
          ...task._doc,
          completedTodoCount: completedCount,
          progress: progressPct,
        };
      })
    );

    const summaryBaseFilter = {
      ...baseFilter,
      ...(isAdmin && restrictToMe ? { responsavel: req.user._id } : {}),
    };

    const allTasks = await Task.countDocuments(summaryBaseFilter);

    const pendingTasks = await Task.countDocuments({
      ...summaryBaseFilter,
      status: "Pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...summaryBaseFilter,
      status: "In Progress",
    });

    const completedTasks = await Task.countDocuments({
      ...summaryBaseFilter,
      status: "Completed",
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
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
      priority,
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
      priority,
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
    task.priority = req.body.priority || task.priority;
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

    if (task.status === "Completed") {
      task.itens.forEach((item) => (item.completed = true));
      task.progress = 100;
      if (!task.completedAt) task.completedAt = new Date();
    } else {
      if (prevStatus === "Completed") task.completedAt = undefined;
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

    const completedCount = task.itens.filter((item) => item.completed).length;
    const totalItems = task.itens.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (totalItems === 0) {
    } else if (completedCount === 0) {
      task.status = "Pending";
      if (task.completedAt) task.completedAt = undefined;
    } else if (completedCount === totalItems) {
      task.status = "Completed";
      if (!task.completedAt) task.completedAt = new Date();
    } else {
      task.status = "In Progress";
      if (task.completedAt) task.completedAt = undefined;
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
            pendingTasks: 0,
            completedTasks: 0,
            overdueTasks: 0,
            onTimeRate: 0,
          },
          charts: {
            taskDistribution: {
              All: 0,
              Pending: 0,
              InProgress: 0,
              Completed: 0,
            },
            taskPriorityLevels: {
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
    const pendingTasks = await Task.countDocuments({
      ...baseMatch,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      ...baseMatch,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      ...baseMatch,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In Progress", "Completed"];
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
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((i) => i._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status priority classification dueDate createdAt responsavel"
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
      const bucket = { Pending: 0, InProgress: 0, Completed: 0 };
      taskStatuses.forEach((st) => {
        const f = statusByFrameworkRaw.find(
          (r) => r._id.classification === fw && r._id.status === st
        );
        if (f) {
          const key = st === "In Progress" ? "InProgress" : st;
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
                cond: { $eq: ["$$t.completed", true] },
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
                  { $eq: ["$status", "Completed"] },
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
                cond: { $eq: ["$$t.completed", true] },
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
                  { $eq: ["$status", "Completed"] },
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
                cond: { $eq: ["$$t.completed", true] },
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
                  { $eq: ["$status", "Completed"] },
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

    const completedInScope = await Task.find({
      ...baseMatch,
      status: "Completed",
    }).select("completedAt dueDate");
    const onTime = completedInScope.filter(
      (t) => t.completedAt && t.dueDate && t.completedAt <= t.dueDate
    ).length;
    const onTimeRate =
      completedInScope.length > 0
        ? Math.round((onTime / completedInScope.length) * 100)
        : 0;

    const tasksByUserAgg = await Task.aggregate([
      { $match: baseMatch },
      { $unwind: "$responsavel" },
      {
        $group: {
          _id: "$responsavel",
          Pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          InProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          Completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          total: { $add: ["$Pending", "$InProgress", "$Completed"] },
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
          Pending: 1,
          InProgress: 1,
          Completed: 1,
          total: 1,
        },
      },
    ]);

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
        onTimeRate,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
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
    const pendingTasks = await Task.countDocuments({
      ...baseMatch,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      ...baseMatch,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      ...baseMatch,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In Progress", "Completed"];
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
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status priority classification dueDate createdAt responsavel"
      )
      .populate("responsavel", "name profileImageUrl");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
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

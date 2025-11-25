const Task = require("../models/Task");

// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route   GET /api/tasks/
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, assignedTo, classification } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    if (classification) {
      filter.classification = classification;
    }

    let tasks;

    // Admin can request only their assigned tasks using ?assignedTo=me
    const restrictToMe = assignedTo === "me";

    if (req.user.role === "admin" && !restrictToMe) {
      if (assignedTo && assignedTo !== "me") {
        filter.assignedTo = assignedTo;
      }
      tasks = await Task.find(filter)
        .populate("assignedTo", "name email profileImageUrl")
        .populate("cliente", "name");
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id })
        .populate("assignedTo", "name email profileImageUrl")
        .populate("cliente", "name");
    }

    // Add completed todoChecklist count and computed progress to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const total = Array.isArray(task.todoChecklist)
          ? task.todoChecklist.length
          : 0;
        const completedCount = Array.isArray(task.todoChecklist)
          ? task.todoChecklist.filter((item) => item.completed).length
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

    // Status summary counts
    const allTasks = await Task.countDocuments(
      req.user.role === "admin" && !restrictToMe
        ? { ...(classification && { classification }) }
        : {
            assignedTo: req.user._id,
            ...(classification && { classification }),
          }
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
      ...((req.user.role !== "admin" || restrictToMe) && {
        assignedTo: req.user._id,
      }),
      ...(classification && { classification }),
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
      ...((req.user.role !== "admin" || restrictToMe) && {
        assignedTo: req.user._id,
      }),
      ...(classification && { classification }),
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...((req.user.role !== "admin" || restrictToMe) && {
        assignedTo: req.user._id,
      }),
      ...(classification && { classification }),
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
      .populate("assignedTo", "name email profileImageUrl")
      .populate("cliente", "name");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks/
// @access  Private (Admin)
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      classification,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      cliente,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo must be an array of user IDs" });
    }

    // Validate cliente if provided
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
      description,
      priority,
      classification,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoChecklist,
      attachments,
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
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.classification = req.body.classification || task.classification;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
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
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
      }
      task.assignedTo = req.body.assignedTo;
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

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newStatus = req.body.status || task.status;
    const prevStatus = task.status;
    task.status = newStatus;

    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
      if (!task.completedAt) task.completedAt = new Date();
    } else {
      // if moving away from Completed, clear completedAt
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
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update checklist" });
    }

    task.todoChecklist = todoChecklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Derive status directly from counts to avoid rounding issues
    if (totalItems === 0) {
      // No checklist: preserve status unless explicitly set elsewhere
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
      "assignedTo",
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
    const { classification, startDate, endDate } = req.query;

    const baseMatch = {};
    if (classification) baseMatch.classification = classification;
    if (startDate || endDate) {
      baseMatch.createdAt = {};
      if (startDate) baseMatch.createdAt.$gte = new Date(startDate);
      if (endDate) baseMatch.createdAt.$lte = new Date(endDate);
    }

    // Statistics (with filters)
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

    // Status distribution
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

    // Priority levels
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

    // Recent tasks
    const recentTasks = await Task.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status priority classification dueDate createdAt assignedTo"
      )
      .populate("assignedTo", "name profileImageUrl");

    // Status by framework
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

    // Completion by framework (average progress from todoChecklist)
    const completionByFrameworkAgg = await Task.aggregate([
      { $match: baseMatch },
      {
        $addFields: {
          totalTodos: { $size: { $ifNull: ["$todoChecklist", []] } },
          doneTodos: {
            $size: {
              $filter: {
                input: { $ifNull: ["$todoChecklist", []] },
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

    // On-time rate among completed
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

    // Tasks by user (Top 5)
    const tasksByUserAgg = await Task.aggregate([
      { $match: baseMatch },
      { $unwind: "$assignedTo" },
      {
        $group: {
          _id: "$assignedTo",
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
    const userId = req.user._id; // Only fetch data for the logged-in user

    // Fetch statistics for user-specific tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // Task distribution by status
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    // Task distribution by priority
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks for the logged-in user
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status priority classification dueDate createdAt assignedTo"
      )
      .populate("assignedTo", "name profileImageUrl");

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};

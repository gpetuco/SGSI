const Acao = require("../models/Acao");

// @desc    Get all acoes
// @route   GET /api/acoes/
// @access  Private
const getAcoes = async (req, res) => {
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
          acoes: [],
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

    let acoes = await Acao.find(listFilter)
      .populate("responsavel", "name email profileImageUrl")
      .populate("cliente", "name");

    acoes = await Promise.all(
      acoes.map(async (acao) => {
        const total = Array.isArray(acao.itens) ? acao.itens.length : 0;
        const concluidoCount = Array.isArray(acao.itens)
          ? acao.itens.filter((item) => item.concluido).length
          : 0;
        const progressPct =
          total > 0
            ? Math.round((concluidoCount / total) * 100)
            : acao.progress || 0;
        return {
          ...acao._doc,
          concluidoTodoCount: concluidoCount,
          progress: progressPct,
        };
      })
    );

    const summaryBaseFilter = {
      ...baseFilter,
      ...(isAdmin && restrictToMe ? { responsavel: req.user._id } : {}),
    };

    const allAcoes = await Acao.countDocuments(summaryBaseFilter);

    const acoesPendentes = await Acao.countDocuments({
      ...summaryBaseFilter,
      status: "Pendente",
    });

    const acoesEmAndamento = await Acao.countDocuments({
      ...summaryBaseFilter,
      status: "Em Andamento",
    });

    const acoesConcluidas = await Acao.countDocuments({
      ...summaryBaseFilter,
      status: "Concluído",
    });

    res.json({
      acoes,
      statusSummary: {
        all: allAcoes,
        acoesPendentes,
        acoesEmAndamento,
        acoesConcluidas,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get acao by ID
// @route   GET /api/acoes/:id
// @access  Private
const getAcaoById = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id)
      .populate("responsavel", "name email profileImageUrl")
      .populate("cliente", "name");

    if (!acao) return res.status(404).json({ message: "Acao not found" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const acaoClienteId = acao.cliente
        ? acao.cliente._id?.toString() || acao.cliente.toString()
        : null;

      if (!userEmpresaId || !acaoClienteId || userEmpresaId !== acaoClienteId) {
        return res.status(403).json({ message: "Acesso negado!" });
      }
    }

    res.json(acao);
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

// @desc    Create a new acao (Admin only)
// @route   POST /api/acoes/
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

    const acao = await Acao.create({
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

    res.status(201).json({ message: "Acao created successfully", acao });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update acao details
// @route   PUT /api/acoes/:id
// @access  Private
const updateAcao = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id);

    if (!acao) return res.status(404).json({ message: "Acao not found" });

    acao.title = req.body.title || acao.title;
    acao.descricao = req.body.descricao || acao.descricao;
    acao.prioridade = req.body.prioridade || acao.prioridade;
    acao.classification = req.body.classification || acao.classification;
    acao.dueDate = req.body.dueDate || acao.dueDate;
    acao.itens = req.body.itens || acao.itens;
    if (Object.prototype.hasOwnProperty.call(req.body, "cliente")) {
      if (!req.body.cliente) {
        acao.cliente = null;
      } else {
        try {
          const Company = require("../models/Company");
          const comp = await Company.findById(req.body.cliente);
          if (!comp)
            return res.status(400).json({ message: "Cliente inválido" });
          acao.cliente = comp._id;
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
      acao.responsavel = req.body.responsavel;
    }

    const updatedAcao = await acao.save();
    res.json({ message: "Acao updated successfully", updatedAcao });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a acao (Admin only)
// @route   DELETE /api/acoes/:id
// @access  Private (Admin)
const deleteAcao = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id);

    if (!acao) return res.status(404).json({ message: "Acao not found" });

    await acao.deleteOne();
    res.json({ message: "Acao deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update acao status
// @route   PUT /api/acoes/:id/status
// @access  Private
const updateAcaoStatus = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id);
    if (!acao) return res.status(404).json({ message: "Acao not found" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const acaoClienteId = acao.cliente ? acao.cliente.toString() : null;

      if (!userEmpresaId || !acaoClienteId || userEmpresaId !== acaoClienteId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const isAssigned = acao.responsavel.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newStatus = req.body.status || acao.status;
    const prevStatus = acao.status;
    acao.status = newStatus;

    if (acao.status === "Concluído") {
      acao.itens.forEach((item) => (item.concluido = true));
      acao.progress = 100;
      if (!acao.concluidoAt) acao.concluidoAt = new Date();
    } else {
      if (prevStatus === "Concluído") acao.concluidoAt = undefined;
    }

    await acao.save();
    res.json({ message: "Acao status updated", acao });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update acao checklist
// @route   PUT /api/acoes/:id/todo
// @access  Private
const updateAcaoChecklist = async (req, res) => {
  try {
    const { itens } = req.body;
    const acao = await Acao.findById(req.params.id);

    if (!acao) return res.status(404).json({ message: "Acao not found" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const acaoClienteId = acao.cliente ? acao.cliente.toString() : null;

      if (!userEmpresaId || !acaoClienteId || userEmpresaId !== acaoClienteId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update checklist" });
      }
    }

    if (!acao.responsavel.includes(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update checklist" });
    }

    acao.itens = itens;

    const concluidoCount = acao.itens.filter((item) => item.concluido).length;
    const totalItems = acao.itens.length;
    acao.progress =
      totalItems > 0 ? Math.round((concluidoCount / totalItems) * 100) : 0;

    if (totalItems === 0) {
    } else if (concluidoCount === 0) {
      acao.status = "Pendente";
      if (acao.concluidoAt) acao.concluidoAt = undefined;
    } else if (concluidoCount === totalItems) {
      acao.status = "Concluído";
      if (!acao.concluidoAt) acao.concluidoAt = new Date();
    } else {
      acao.status = "Em Andamento";
      if (acao.concluidoAt) acao.concluidoAt = undefined;
    }

    await acao.save();
    const updatedAcao = await Acao.findById(req.params.id).populate(
      "responsavel",
      "name email profileImageUrl"
    );

    res.json({ message: "Acao checklist updated", acao: updatedAcao });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard Data (Admin only)
// @route   GET /api/acoes/dashboard-data
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
            totalAcoes: 0,
            acoesPendentes: 0,
            acoesConcluidas: 0,
            overdueAcoes: 0,
            onTimeRate: 0,
          },
          charts: {
            dadosAcoes: {
              All: 0,
              Pendente: 0,
              EmAndamento: 0,
              Concluído: 0,
            },
            acaoPrioridadeLevels: {
              Baixa: 0,
              Media: 0,
              Alta: 0,
            },
            statusByFramework: {},
            completionByFramework: [],
            completionByNistFunction: [],
            completionByIsoControlType: [],
            acoesByUser: [],
          },
          recentAcoes: [],
        });
      }
      baseMatch.cliente = req.user.empresa;
    }

    const totalAcoes = await Acao.countDocuments(baseMatch);
    const acoesPendentes = await Acao.countDocuments({
      ...baseMatch,
      status: "Pendente",
    });
    const acoesConcluidas = await Acao.countDocuments({
      ...baseMatch,
      status: "Concluído",
    });
    const overdueAcoes = await Acao.countDocuments({
      ...baseMatch,
      status: { $ne: "Concluído" },
      dueDate: { $lt: new Date() },
    });

    const acaoStatuses = ["Pendente", "Em Andamento", "Concluído"];
    const dadosAcoesRaw = await Acao.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const dadosAcoes = acaoStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        dadosAcoesRaw.find((i) => i._id === status)?.count || 0;
      return acc;
    }, {});
    dadosAcoes["All"] = totalAcoes;

    const acaoPriorities = ["Baixa", "Media", "Alta"];
    const acaoPrioridadeLevelsRaw = await Acao.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$prioridade", count: { $sum: 1 } } },
    ]);
    const acaoPrioridadeLevels = acaoPriorities.reduce((acc, prioridade) => {
      acc[prioridade] =
        acaoPrioridadeLevelsRaw.find((i) => i._id === prioridade)?.count || 0;
      return acc;
    }, {});

    const recentAcoes = await Acao.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status prioridade classification dueDate createdAt responsavel"
      )
      .populate("responsavel", "name profileImageUrl");

    const frameworks = ["NIST CSF", "ISO 27001"];
    const statusByFrameworkRaw = await Acao.aggregate([
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
      acaoStatuses.forEach((st) => {
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

    const completionByFrameworkAgg = await Acao.aggregate([
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
    const completionByNistFunctionAgg = await Acao.aggregate([
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
    const completionByIsoControlTypeAgg = await Acao.aggregate([
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

    const concluidoInScope = await Acao.find({
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

    const acoesByUserAgg = await Acao.aggregate([
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
        totalAcoes,
        acoesPendentes,
        acoesConcluidas,
        overdueAcoes,
        onTimeRate,
      },
      charts: {
        dadosAcoes,
        acaoPrioridadeLevels,
        statusByFramework,
        completionByFramework,
        completionByNistFunction,
        completionByIsoControlType,
        acoesByUser: acoesByUserAgg,
      },
      recentAcoes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard Data (User-specific)
// @route   GET /api/acoes/user-dashboard-data
// @access  Private
const getDashboardClienteData = async (req, res) => {
  try {
    const userId = req.user._id;
    const empresaId = req.user.empresa || null;

    const baseMatch = empresaId
      ? { responsavel: userId, cliente: empresaId }
      : { responsavel: userId };

    const totalAcoes = await Acao.countDocuments(baseMatch);
    const acoesPendentes = await Acao.countDocuments({
      ...baseMatch,
      status: "Pendente",
    });
    const acoesConcluidas = await Acao.countDocuments({
      ...baseMatch,
      status: "Concluído",
    });
    const overdueAcoes = await Acao.countDocuments({
      ...baseMatch,
      status: { $ne: "Concluído" },
      dueDate: { $lt: new Date() },
    });

    const acaoStatuses = ["Pendente", "Em Andamento", "Concluído"];
    const dadosAcoesRaw = await Acao.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const dadosAcoes = acaoStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        dadosAcoesRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    dadosAcoes["All"] = totalAcoes;

    const acaoPriorities = ["Baixa", "Media", "Alta"];
    const acaoPrioridadeLevelsRaw = await Acao.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$prioridade", count: { $sum: 1 } } },
    ]);

    const acaoPrioridadeLevels = acaoPriorities.reduce((acc, prioridade) => {
      acc[prioridade] =
        acaoPrioridadeLevelsRaw.find((item) => item._id === prioridade)
          ?.count || 0;
      return acc;
    }, {});

    const recentAcoes = await Acao.find(baseMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title status prioridade classification dueDate createdAt responsavel"
      )
      .populate("responsavel", "name profileImageUrl");

    res.status(200).json({
      statistics: {
        totalAcoes,
        acoesPendentes,
        acoesConcluidas,
        overdueAcoes,
      },
      charts: {
        dadosAcoes,
        acaoPrioridadeLevels,
      },
      recentAcoes,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

module.exports = {
  getAcoes,
  getAcaoById,
  criarAcao,
  updateAcao,
  deleteAcao,
  updateAcaoStatus,
  updateAcaoChecklist,
  getDashboardData,
  getDashboardClienteData,
};

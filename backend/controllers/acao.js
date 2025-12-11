const Acao = require("../models/Acao");

const criarAcao = async (req, res) => {
  try {
    const {
      title,
      descricao,
      prioridade,
      classification,
      previsao,
      responsavel,
      itens,
      cliente,
    } = req.body;

    if (!Array.isArray(responsavel)) {
      return res
        .status(400)
        .json({ message: "responsavel deve ter IDs de usuarios" });
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
      previsao,
      responsavel,
      criadoPor: req.user._id,
      itens,
      cliente: clienteId,
    });

    res.status(201).json({ message: "Acao criada com sucesso", acao });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const updateAcao = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id);

    if (!acao) return res.status(404).json({ message: "Acao nao encontrada" });

    acao.title = req.body.title || acao.title;
    acao.descricao = req.body.descricao || acao.descricao;

    acao.classification = req.body.classification || acao.classification;
    acao.prioridade = req.body.prioridade || acao.prioridade;
    acao.itens = req.body.itens || acao.itens;
    acao.previsao = req.body.previsao || acao.previsao;

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
          .json({ message: "responsavel deve ser IDs de usuarios" });
      }
      acao.responsavel = req.body.responsavel;
    }

    const updatedAcao = await acao.save();
    res.json({ message: "Acao salva com sucesso", updatedAcao });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const deleteAcao = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id);

    if (!acao) return res.status(404).json({ message: "Acao nao encontrada" });

    await acao.deleteOne();
    res.json({ message: "Acao excluida" });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const getAcoes = async (req, res) => {
  try {
    const { status, responsavel, classification, cliente } = req.query;
    const isAdmin = req.user.role === "admin";
    const restrictToMe = responsavel === "me";

    let filtroAcoes = {};

    if (status) {
      filtroAcoes.status = status;
    }
    if (classification) {
      filtroAcoes.classification = classification;
    }

    if (isAdmin) {
      if (cliente) {
        filtroAcoes.cliente = cliente;
      }
      if (responsavel && !restrictToMe) {
        filtroAcoes.responsavel = responsavel;
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

      filtroAcoes.cliente = req.user.empresa;

      if (restrictToMe) {
        filtroAcoes.responsavel = req.user._id;
      } else if (responsavel && responsavel !== "me") {
        filtroAcoes.responsavel = responsavel;
      }
    }

    const listFilter = {
      ...filtroAcoes,
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
        const progressoPct =
          total > 0
            ? Math.round((concluidoCount / total) * 100)
            : acao.progresso || 0;
        return {
          ...acao._doc,
          itensConcluidos: concluidoCount,
          progresso: progressoPct,
        };
      })
    );

    const retornoFilter = {
      ...filtroAcoes,
      ...(isAdmin && restrictToMe ? { responsavel: req.user._id } : {}),
    };

    const allAcoes = await Acao.countDocuments(retornoFilter);

    const acoesPendentes = await Acao.countDocuments({
      ...retornoFilter,
      status: "Pendente",
    });

    const acoesEmAndamento = await Acao.countDocuments({
      ...retornoFilter,
      status: "Em Andamento",
    });

    const acoesConcluidas = await Acao.countDocuments({
      ...retornoFilter,
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
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const updateAcaoStatus = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id);
    if (!acao) return res.status(404).json({ message: "Acao nao encontrada" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const acaoClienteId = acao.cliente ? acao.cliente.toString() : null;

      if (!userEmpresaId || !acaoClienteId || userEmpresaId !== acaoClienteId) {
        return res.status(403).json({ message: "Sem autorizacao" });
      }
    }

    const isAssigned = acao.responsavel.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Sem autorizacao" });
    }

    const newStatus = req.body.status || acao.status;
    const prevStatus = acao.status;
    acao.status = newStatus;

    if (acao.status === "Concluído") {
      acao.itens.forEach((item) => (item.concluido = true));
      acao.progresso = 100;
      if (!acao.concluidoAt) acao.concluidoAt = new Date();
    } else {
      if (prevStatus === "Concluído") acao.concluidoAt = undefined;
    }

    await acao.save();
    res.json({ message: "Acao status salvo", acao });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const updateAcaoChecklist = async (req, res) => {
  try {
    const { itens } = req.body;
    const acao = await Acao.findById(req.params.id);

    if (!acao) return res.status(404).json({ message: "Acao nao encontrada" });

    if (req.user.role === "member") {
      const userEmpresaId = req.user.empresa
        ? req.user.empresa.toString()
        : null;
      const acaoClienteId = acao.cliente ? acao.cliente.toString() : null;

      if (!userEmpresaId || !acaoClienteId || userEmpresaId !== acaoClienteId) {
        return res.status(403).json({ message: "Sem autorizacao!" });
      }
    }

    if (!acao.responsavel.includes(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Sem autorizacao!" });
    }

    acao.itens = itens;

    const concluidoCount = acao.itens.filter((item) => item.concluido).length;
    const totalItems = acao.itens.length;
    acao.progresso =
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
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

const getAcaoUnique = async (req, res) => {
  try {
    const acao = await Acao.findById(req.params.id)
      .populate("responsavel", "name email profileImageUrl")
      .populate("cliente", "name");

    if (!acao) return res.status(404).json({ message: "Acao nao encontrada!" });

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

const getDashboardData = async (req, res) => {
  try {
    const { classification, startDate, endDate, cliente } = req.query;
    const isAdmin = req.user.role === "admin";

    const baseMatch = {};
    if (classification) baseMatch.classification = classification;
    if (startDate || endDate) {
      baseMatch.dataCriacao = {};
      if (startDate) baseMatch.dataCriacao.$gte = new Date(startDate);
      if (endDate) baseMatch.dataCriacao.$lte = new Date(endDate);
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
      previsao: { $lt: new Date() },
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
          progresso: {
            $cond: [
              { $gt: ["$totalTodos", 0] },
              { $multiply: [{ $divide: ["$doneTodos", "$totalTodos"] }, 100] },
              {
                $cond: [
                  { $eq: ["$status", "Concluído"] },
                  100,
                  { $ifNull: ["$progresso", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$classification",
          avgProgresso: { $avg: "$progresso" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          framework: "$_id",
          percent: { $round: ["$avgProgresso", 0] },
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
          progresso: {
            $cond: [
              { $gt: ["$totalTodos", 0] },
              { $multiply: [{ $divide: ["$doneTodos", "$totalTodos"] }, 100] },
              {
                $cond: [
                  { $eq: ["$status", "Concluído"] },
                  100,
                  { $ifNull: ["$progresso", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$nistFunction",
          avgProgresso: { $avg: "$progresso" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          func: "$_id",
          percent: { $round: ["$avgProgresso", 0] },
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
          progresso: {
            $cond: [
              { $gt: ["$totalTodos", 0] },
              { $multiply: [{ $divide: ["$doneTodos", "$totalTodos"] }, 100] },
              {
                $cond: [
                  { $eq: ["$status", "Concluído"] },
                  100,
                  { $ifNull: ["$progresso", 0] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$isoType",
          avgProgresso: { $avg: "$progresso" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          percent: { $round: ["$avgProgresso", 0] },
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
    }).select("concluidoAt previsao");
    const onTime = concluidoInScope.filter(
      (t) => t.concluidoAt && t.previsao && t.concluidoAt <= t.previsao
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
    });
  } catch (error) {
    res.status(500).json({ message: "Erro: ", error: error.message });
  }
};

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
      previsao: { $lt: new Date() },
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
    });
  } catch (error) {
    res.status(500).json({ message: "Erro:", error: error.message });
  }
};

module.exports = {
  getAcoes,
  getAcaoUnique,
  criarAcao,
  updateAcao,
  deleteAcao,
  updateAcaoStatus,
  updateAcaoChecklist,
  getDashboardData,
  getDashboardClienteData,
};

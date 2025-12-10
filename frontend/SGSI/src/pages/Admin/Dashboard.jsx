import React, { useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import { addThousandsSeparator } from "../../utils/helper";
import Info from "../../components/Cards/Info";
import PieWc from "../../components/Graficos/PizzaWc";
import AreaWc from "../../components/Graficos/AreaWc";
import LineWc from "../../components/Graficos/LineWc";
import StackedStatusByFramework from "../../components/Graficos/StackedStatusByFramework";
import PercentBarByFramework from "../../components/Graficos/PercentBarByFramework";
import StackedStatusByUser from "../../components/Graficos/StackedStatusByUser";
import {
  PieChart as RePieChart,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer as ReResponsiveContainer,
} from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Modal from "../../components/Modal";
const COLORS = ["#ff0000", "#FACC15", "#22C55E"];
const NIST_FUNCTION_COLORS = {
  Govern: "#8D51FF",
  Identify: "#00B8DB",
  Protect: "#00BC7D",
  Detect: "#FACC15",
  Respond: "#FB7185",
  Recover: "#22C55E",
};
const ISO_CONTROL_COLORS = {
  Organisational: "#4F46E5",
  People: "#0EA5E9",
  Physical: "#22C55E",
  Technological: "#F97316",
};

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [stackedStatusData, setStackedStatusData] = useState([]);
  const [completionPercentData, setCompletionPercentData] = useState([]);
  const [frameworkLineData, setFrameworkLineData] = useState([]);
  const [tasksByUserData, setTasksByUserData] = useState([]);
  const [nistFunctionCompletionData, setNistFunctionCompletionData] = useState(
    []
  );
  const [isoControlCompletionData, setIsoControlCompletionData] = useState([]);
  const [fwModal, setFwModal] = useState({ open: false, fw: null, percent: 0 });

  const [classificationFilter, setClassificationFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { status: "Pendente", count: taskDistribution?.Pending || 0 },
      { status: "Em Andamento", count: taskDistribution?.InProgress || 0 },
      { status: "Concluído", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      { priority: "Baixa", count: taskPriorityLevels?.Low || 0 },
      { priority: "Média", count: taskPriorityLevels?.Medium || 0 },
      { priority: "Alta", count: taskPriorityLevels?.High || 0 },
    ];

    setBarChartData(PriorityLevelData);

    const statusByFramework = data?.statusByFramework || {};
    const stacked = ["ISO 27001", "NIST CSF"].map((fw) => ({
      framework: fw,
      Pending: statusByFramework?.[fw]?.Pending || 0,
      InProgress: statusByFramework?.[fw]?.InProgress || 0,
      Completed: statusByFramework?.[fw]?.Completed || 0,
    }));
    setStackedStatusData(stacked);

    const frameworks = ["NIST CSF", "ISO 27001"];
    const line = [
      {
        name: "Pendente",
        "NIST CSF": statusByFramework?.["NIST CSF"]?.Pending || 0,
        "ISO 27001": statusByFramework?.["ISO 27001"]?.Pending || 0,
      },
      {
        name: "Em Andamento",
        "NIST CSF": statusByFramework?.["NIST CSF"]?.InProgress || 0,
        "ISO 27001": statusByFramework?.["ISO 27001"]?.InProgress || 0,
      },
      {
        name: "Concluído",
        "NIST CSF": statusByFramework?.["NIST CSF"]?.Completed || 0,
        "ISO 27001": statusByFramework?.["ISO 27001"]?.Completed || 0,
      },
    ];
    setFrameworkLineData(line);

    const completion = (data?.completionByFramework || []).map((i) => ({
      framework: i.framework,
      percent: i.percent,
    }));
    setCompletionPercentData(completion);

    const nistCompletionRaw = data?.completionByNistFunction || [];
    const nistCompletion = nistCompletionRaw.map((i) => ({
      function: i.function,
      percent: i.percent,
      total: i.total,
    }));
    setNistFunctionCompletionData(nistCompletion);

    const tbu = (data?.tasksByUser || []).map((i) => ({
      user: i.user,
      userId: i.userId,
      Pending: i.Pending || 0,
      InProgress: i.InProgress || 0,
      Completed: i.Completed || 0,
      total: i.total || 0,
    }));
    const isoCompletionRaw = data?.completionByIsoControlType || [];
    const isoCompletion = isoCompletionRaw.map((i) => ({
      type: i.type,
      percent: i.percent,
      total: i.total,
    }));
    setIsoControlCompletionData(isoCompletion);

    setTasksByUserData(tbu);
  };

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (classificationFilter !== "All")
        params.classification = classificationFilter;

      const response = await axiosReq.get(API_PATHS.TASKS.GET_DASHBOARD_DATA, {
        params,
      });
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSeeMore = () => {
    if (user?.role === "member") {
      navigate("/user/tasks");
    } else {
      navigate("/admin/tasks");
    }
  };

  useEffect(() => {
    getDashboardData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classificationFilter]);

  const formatLongPtBr = () => {
    const s = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (loading && !dashboardData) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="card my-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-2xl">Dashboard</h2>
              <p className="text-xs text-slate-500 mt-2">
                Carregando dados do dashboard...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl">Dashboard</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <Info
            label="Ações"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />

          <Info
            label="Pendentes"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />

          <Info
            label="Em Andamento"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />

          <Info
            label="Concluídas"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      {/* Completion by framework mini-cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {[
          { label: "NIST CSF", color: "#00B8DB" },
          { label: "ISO 27001", color: COLORS[2] },
        ].map((fw) => {
          const pct =
            completionPercentData.find((i) => i.framework === fw.label)
              ?.percent || 0;
          const clamped = Math.max(0, Math.min(100, pct));
          const donutData = [
            { name: "done", value: clamped },
            { name: "remain", value: 100 - clamped },
          ];
          return (
            <div
              key={fw.label}
              className="card relative group flex items-center justify-between p-3 md:p-4 min-h-[96px]"
            >
              <button
                aria-label="Zoom"
                className="chart-zoom-btn opacity-0 group-hover:opacity-100"
                onClick={() =>
                  setFwModal({
                    open: true,
                    fw: fw.label,
                    percent: clamped,
                    color: fw.color,
                  })
                }
              >
                <LuZoomIn className="text-lg" />
              </button>
              <div className="pl-1">
                <div
                  className="text-xs md:text-sm font-bold tracking-wide uppercase"
                  style={{ color: fw.color }}
                >
                  {fw.label}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold leading-none text-gray-900 dark:text-white mt-2">
                  {clamped}%
                </div>
              </div>
              <div className="pr-1 w-[72px] h-[72px] md:w-[88px] md:h-[88px] flex items-center justify-center">
                <ReResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <RePie
                      data={donutData}
                      dataKey="value"
                      innerRadius={"60%"}
                      outerRadius={"85%"}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <ReCell fill={fw.color} />
                      <ReCell fill="#CBD5E1" />
                    </RePie>
                  </RePieChart>
                </ReResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {nistFunctionCompletionData?.length > 0 && (
        <div className="card my-5">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">NIST CSF - Funções</h5>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-6">
            {nistFunctionCompletionData.map((fn) => (
              <Info
                key={fn.function}
                label={`${fn.function} (${fn.total})`}
                value={`${fn.percent}%`}
                color="bg-primary"
              />
            ))}
          </div>
        </div>
      )}

      {nistFunctionCompletionData?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 my-4">
          {nistFunctionCompletionData.map((fn) => {
            const pct = Math.max(0, Math.min(100, fn.percent || 0));
            const donutData = [
              { name: "done", value: pct },
              { name: "remain", value: 100 - pct },
            ];
            const color = pct === 100 ? "#22C55E" : "#FACC15";

            return (
              <div
                key={fn.function}
                className="card flex flex-col items-center justify-between px-3 py-3"
              >
                <div className="text-xs md:text-sm font-semibold text-center text-gray-700 dark:text-slate-200">
                  {fn.function}
                </div>
                <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] my-2 flex items-center justify-center">
                  <ReResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <RePie
                        data={donutData}
                        dataKey="value"
                        innerRadius={"60%"}
                        outerRadius={"85%"}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <ReCell fill={color} />
                        <ReCell fill="#CBD5E1" />
                      </RePie>
                    </RePieChart>
                  </ReResponsiveContainer>
                </div>
                <div className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                  {pct}%
                </div>
                <div className="text-[11px] md:text-xs text-gray-500 dark:text-slate-300">
                  {fn.total || 0} ações
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isoControlCompletionData?.length > 0 && (
        <div className="card my-5">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">ISO 27001 - Controles</h5>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 md:gap-6">
            {isoControlCompletionData.map((ctrl) => (
              <Info
                key={ctrl.type}
                label={`${ctrl.type} (${ctrl.total})`}
                value={`${ctrl.percent}%`}
                color="bg-primary"
              />
            ))}
          </div>
        </div>
      )}

      {isoControlCompletionData?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 md:gap-4 my-4">
          {isoControlCompletionData.map((ctrl) => {
            const pct = Math.max(0, Math.min(100, ctrl.percent || 0));
            const donutData = [
              { name: "done", value: pct },
              { name: "remain", value: 100 - pct },
            ];
            const color = pct === 100 ? "#22C55E" : "#FACC15";

            return (
              <div
                key={ctrl.type}
                className="card flex flex-col items-center justify-between px-3 py-3"
              >
                <div className="text-xs md:text-sm font-semibold text-center text-gray-700 dark:text-slate-200">
                  {ctrl.type}
                </div>
                <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] my-2 flex items-center justify-center">
                  <ReResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <RePie
                        data={donutData}
                        dataKey="value"
                        innerRadius={"60%"}
                        outerRadius={"85%"}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <ReCell fill={color} />
                        <ReCell fill="#CBD5E1" />
                      </RePie>
                    </RePieChart>
                  </ReResponsiveContainer>
                </div>
                <div className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                  {pct}%
                </div>
                <div className="text-[11px] md:text-xs text-gray-500 dark:text-slate-300">
                  {ctrl.total || 0} ações
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fwModal.open && (
        <Modal
          isOpen={fwModal.open}
          onClose={() => setFwModal({ open: false, fw: null, percent: 0 })}
          title={`${fwModal.fw}`}
          variant="wide"
        >
          {(() => {
            const entry =
              stackedStatusData.find((e) => e.framework === fwModal.fw) || {};
            const pending = entry.Pending || 0;
            const inProgress = entry.InProgress || 0;
            const completed = entry.Completed || 0;
            const total = pending + inProgress + completed;
            return (
              <div>
                <div className="flex items-center justify-center gap-10 md:gap-16 py-6">
                  <div className="text-center">
                    <div
                      className="text-sm font-bold uppercase"
                      style={{ color: fwModal.color }}
                    >
                      {fwModal.fw}
                    </div>
                    <div className="text-6xl md:text-7xl font-extrabold leading-none mt-2">
                      {fwModal.percent}%
                    </div>
                  </div>
                  <div className="w-[160px] h-[160px]">
                    <ReResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <RePie
                          data={[
                            { name: "done", value: fwModal.percent },
                            { name: "remain", value: 100 - fwModal.percent },
                          ]}
                          dataKey="value"
                          innerRadius={"60%"}
                          outerRadius={"85%"}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          <ReCell fill={fwModal.color || "#1368ec"} />
                          <ReCell fill="#CBD5E1" />
                        </RePie>
                      </RePieChart>
                    </ReResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="font-medium">{total} Total</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                    <span className="font-medium">
                      {pending} Ações Pendentes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    <span className="font-medium">
                      {inProgress} Ações Em Andamento
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                    <span className="font-medium">
                      {completed} Ações Concluídas
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Prioridade</h5>
            </div>

            <AreaWc
              data={barChartData}
              xKey="priority"
              areas={[{ dataKey: "count", color: "#1368ec", name: "Ações" }]}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Status</h5>
            </div>

            <PieWc data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Status por Framework</h5>
            </div>
            <StackedStatusByFramework data={stackedStatusData} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Progresso (%)</h5>
            </div>
            <PercentBarByFramework data={completionPercentData} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Status por Framework</h5>
            </div>
            <LineWc
              data={frameworkLineData}
              xKey="name"
              lines={[
                { dataKey: "NIST CSF", color: "#00B8DB", name: "NIST CSF" },
                { dataKey: "ISO 27001", color: "#7BCE00", name: "ISO 27001" },
              ]}
            />
          </div>
        </div>
        {user?.role === "admin" && (
          <div className="md:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Top 5 (Membros)</h5>
              </div>
              <StackedStatusByUser data={tasksByUserData} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

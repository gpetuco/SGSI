import React, { useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import CustomAreaChart from "../../components/Charts/CustomAreaChart";
import CustomLineChart from "../../components/Charts/CustomLineChart";
import StackedStatusByFramework from "../../components/Charts/StackedStatusByFramework";
import PercentBarByFramework from "../../components/Charts/PercentBarByFramework";
import StackedStatusByUser from "../../components/Charts/StackedStatusByUser";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import { CLASSIFICATION_DATA } from "../../utils/data";
import { PieChart as RePieChart, Pie as RePie, Cell as ReCell, ResponsiveContainer as ReResponsiveContainer } from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Modal from "../../components/Modal";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

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
  const [fwModal, setFwModal] = useState({ open: false, fw: null, percent: 0 });

  const [classificationFilter, setClassificationFilter] = useState("All");

  // Prepare Chart Data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ];

    setBarChartData(PriorityLevelData);

    // Stacked status by framework
    const statusByFramework = data?.statusByFramework || {};
    const stacked = ["GRC", "ISO 27001", "NIST CSF"].map((fw) => ({
      framework: fw,
      Pending: statusByFramework?.[fw]?.Pending || 0,
      InProgress: statusByFramework?.[fw]?.InProgress || 0,
      Completed: statusByFramework?.[fw]?.Completed || 0,
    }));
    setStackedStatusData(stacked);

    // Line chart data by status with one line per framework
    const frameworks = ["GRC", "NIST CSF", "ISO 27001"]; // requested order
    const line = [
      {
        name: "Pending",
        GRC: statusByFramework?.["GRC"]?.Pending || 0,
        "NIST CSF": statusByFramework?.["NIST CSF"]?.Pending || 0,
        "ISO 27001": statusByFramework?.["ISO 27001"]?.Pending || 0,
      },
      {
        name: "In Progress",
        GRC: statusByFramework?.["GRC"]?.InProgress || 0,
        "NIST CSF": statusByFramework?.["NIST CSF"]?.InProgress || 0,
        "ISO 27001": statusByFramework?.["ISO 27001"]?.InProgress || 0,
      },
      {
        name: "Completed",
        GRC: statusByFramework?.["GRC"]?.Completed || 0,
        "NIST CSF": statusByFramework?.["NIST CSF"]?.Completed || 0,
        "ISO 27001": statusByFramework?.["ISO 27001"]?.Completed || 0,
      },
    ];
    setFrameworkLineData(line);

    // Completion % bar by framework
    const completion = (data?.completionByFramework || []).map((i) => ({
      framework: i.framework,
      percent: i.percent,
    }));
    setCompletionPercentData(completion);

    // Tasks by user (Top 5)
    const tbu = (data?.tasksByUser || []).map((i) => ({
      user: i.user,
      userId: i.userId,
      Pending: i.Pending || 0,
      InProgress: i.InProgress || 0,
      Completed: i.Completed || 0,
      total: i.total || 0,
    }));
    setTasksByUserData(tbu);
  };

  const getDashboardData = async () => {
    try {
      const params = {};
      if (classificationFilter !== "All")
        params.classification = classificationFilter;

      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_DASHBOARD_DATA,
        { params }
      );
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const onSeeMore = () => {
    navigate("/admin/tasks");
  };

  useEffect(() => {
    getDashboardData();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classificationFilter]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl">Bem-vindo, {user?.name}!</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full lg:w-auto lg:min-w-[240px]">
            <SelectDropdown
              options={[{ label: "All", value: "All" }, ...CLASSIFICATION_DATA]}
              value={classificationFilter}
              onChange={setClassificationFilter}
              placeholder="Classification"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />

          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />

          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />

          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
      </div>
    </div>

      {/* Completion by framework mini-cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {[
          { label: "GRC", color: COLORS[0] },
          { label: "ISO 27001", color: COLORS[2] },
          { label: "NIST CSF", color: COLORS[1] },
        ].map((fw) => {
          const pct =
            completionPercentData.find((i) => i.framework === fw.label)?.percent || 0;
          const clamped = Math.max(0, Math.min(100, pct));
          const donutData = [
            { name: "done", value: clamped },
            { name: "remain", value: 100 - clamped },
          ];
          return (
            <div key={fw.label} className="card relative group flex items-center justify-between p-4 min-h-[112px]">
              <button
                aria-label="Zoom"
                className="chart-zoom-btn opacity-0 group-hover:opacity-100"
                onClick={() => setFwModal({ open: true, fw: fw.label, percent: clamped, color: fw.color })}
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
                <div className="text-4xl font-extrabold leading-none text-gray-900 dark:text-white mt-2">
                  {clamped}%
                </div>
              </div>
              <div className="pr-1 w-[88px] h-[88px] flex items-center justify-center">
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

      {/* Framework zoom modal */}
      {fwModal.open && (
        <Modal
          isOpen={fwModal.open}
          onClose={() => setFwModal({ open: false, fw: null, percent: 0 })}
          title={`${fwModal.fw}`}
          variant="wide"
        >
          {(() => {
            const entry = stackedStatusData.find((e) => e.framework === fwModal.fw) || {};
            const pending = entry.Pending || 0;
            const inProgress = entry.InProgress || 0;
            const completed = entry.Completed || 0;
            const total = pending + inProgress + completed;
            return (
              <div>
                <div className="flex items-center justify-center gap-10 md:gap-16 py-6">
                  <div className="text-center">
                    <div className="text-sm font-bold uppercase" style={{ color: fwModal.color }}>{fwModal.fw}</div>
                    <div className="text-6xl md:text-7xl font-extrabold leading-none mt-2">{fwModal.percent}%</div>
                  </div>
                  <div className="w-[160px] h-[160px]">
                    <ReResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <RePie data={[
                          { name: 'done', value: fwModal.percent },
                          { name: 'remain', value: 100 - fwModal.percent },
                        ]}
                          dataKey="value"
                          innerRadius={"60%"}
                          outerRadius={"85%"}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          <ReCell fill={fwModal.color || '#1368ec'} />
                          <ReCell fill="#CBD5E1" />
                        </RePie>
                      </RePieChart>
                    </ReResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="font-medium">{total} Total Tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                    <span className="font-medium">{pending} Pending Tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    <span className="font-medium">{inProgress} In Progress Tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-important">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                    <span className="font-medium">{completed} Completed Tasks</span>
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
              <h5 className="font-medium">Task Distribution</h5>
            </div>

            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Priority</h5>
            </div>

            <CustomAreaChart
              data={barChartData}
              xKey="priority"
              areas={[{ dataKey: "count", color: "#1368ec", name: "Tasks" }]}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Status by Framework</h5>
            </div>
            <StackedStatusByFramework data={stackedStatusData} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Completion % by Framework</h5>
            </div>
            <PercentBarByFramework data={completionPercentData} />
          </div>
        </div>

        {/* Line chart: one line per framework by status */}
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Framework Lines by Status</h5>
            </div>
            <CustomLineChart
              data={frameworkLineData}
              xKey="name"
              lines={[
                { dataKey: "GRC", color: "#8D51FF", name: "GRC" },
                { dataKey: "NIST CSF", color: "#00B8DB", name: "NIST CSF" },
                { dataKey: "ISO 27001", color: "#7BCE00", name: "ISO 27001" },
              ]}
            />
          </div>
        </div>

        {/* Tasks by User (Top 5) - grouped bars */}
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Tasks by User (Top 5)</h5>
            </div>
            <StackedStatusByUser data={tasksByUserData} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between ">
              <h5 className="text-lg">Recent Tasks</h5>

              <button className="card-btn" onClick={onSeeMore}>
                See All <LuArrowRight className="text-base" />
              </button>
            </div>

            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { hookUsuarioPermission } from "../../hooks/hookUsuarioPermission";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import { formatMilhar } from "../../utils/utils";
import Info from "../../components/Panels/Info";
import PizzaWc from "../../components/Graficos/PizzaWc";
import BarWc from "../../components/Graficos/BarWc";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const DashboardCliente = () => {
  hookUsuarioPermission();

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // Prepare Chart Data
  const prepareChartData = (data) => {
    const dadosAcoes = data?.dadosAcoes || null;
    const acaoPrioridadeLevels = data?.acaoPrioridadeLevels || null;

    const dadosAcoesDetalhes = [
      { status: "Pendente", count: dadosAcoes?.Pendente || 0 },
      { status: "Em Andamento", count: dadosAcoes?.EmAndamento || 0 },
      { status: "Concluído", count: dadosAcoes?.Concluído || 0 },
    ];

    setPieChartData(dadosAcoesDetalhes);

    const PrioridadeLevelData = [
      { prioridade: "Baixa", count: acaoPrioridadeLevels?.Baixa || 0 },
      { prioridade: "Media", count: acaoPrioridadeLevels?.Media || 0 },
      { prioridade: "Alta", count: acaoPrioridadeLevels?.Alta || 0 },
    ];

    setBarChartData(PrioridadeLevelData);
  };

  const getDashboardData = async () => {
    try {
      const response = await axiosReq.get(
        URLS_API.ACOES.GET_USER_DASHBOARD_DATA
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
    navigate("/admin/acoes");
  };

  useEffect(() => {
    getDashboardData();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatLongPtBr = () => {
    const s = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="content-box my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">Bem vindo {user?.name}!</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {formatLongPtBr()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <Info
            label="Total Acoes"
            value={formatMilhar(dashboardData?.charts?.dadosAcoes?.All || 0)}
            color="bg-primary"
          />

          <Info
            label="Pendente Acoes"
            value={formatMilhar(
              dashboardData?.charts?.dadosAcoes?.Pendente || 0
            )}
            color="bg-violet-500"
          />

          <Info
            label="Em Andamento Acoes"
            value={formatMilhar(
              dashboardData?.charts?.dadosAcoes?.EmAndamento || 0
            )}
            color="bg-cyan-500"
          />

          <Info
            label="Ações Concluídas"
            value={formatMilhar(
              dashboardData?.charts?.dadosAcoes?.Concluído || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="content-box">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Acao Distribution</h5>
            </div>

            <PizzaWc data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className="content-box">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Acao Prioridade Levels</h5>
            </div>

            <BarWc data={barChartData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCliente;

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import Acao from "../../components/Cards/Acao";
import { useNavigate } from "react-router-dom";
import Lista from "../../components/Inputs/Lista";
import { PRIORIDADE_DATA } from "../../utils/menus";

const Column = ({ title, tasks, onOpen }) => {
  return (
    <div className="bg-white border border-gray-200/60 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded">
            No tasks
          </div>
        ) : (
          tasks.map((item) => (
            <div className="h-[280px]">
              <Acao
                key={item._id}
                title={item.title}
                descricao={item.descricao}
                prioridade={item.prioridade}
                classification={item.classification}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                responsavel={item.responsavel?.map((p) => p.profileImageUrl)}
                concluidoTodoCount={item.concluidoTodoCount || 0}
                itens={item.itens || []}
                clienteName={item.cliente?.name}
                onClick={() => onOpen(item._id)}
                className="h-full"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Kanban = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedPrioridade, setSelectedPrioridade] = useState("All");
  const navigate = useNavigate();

  const getMyTasks = async () => {
    try {
      const response = await axiosReq.get(API_PATHS.TASKS.GET_ALL_TASKS);
      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getMyTasks();
    return () => {};
  }, []);

  const grouped = useMemo(() => {
    const source =
      selectedPrioridade === "All"
        ? tasks
        : tasks.filter((t) => t.prioridade === selectedPrioridade);
    const by = { Pendente: [], "Em Andamento": [], Concluído: [] };
    for (const t of source) {
      if (by[t.status]) by[t.status].push(t);
    }
    return by;
  }, [tasks, selectedPrioridade]);

  const handleOpen = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  return (
    <DashboardLayout activeMenu="Kanban">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Kanban</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 w-full md:w-[220px]">
            <div className="w-full md:w-[210px]">
              <label className="text-xs font-medium text-slate-600">
                Prioridade
              </label>
              <Lista
                options={[{ label: "All", value: "All" }, ...PRIORIDADE_DATA]}
                value={selectedPrioridade}
                onChange={setSelectedPrioridade}
                placeholder="All Priorities"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Column
            title="Pendente"
            tasks={grouped["Pendente"]}
            onOpen={handleOpen}
          />
          <Column
            title="Em Andamento"
            tasks={grouped["Em Andamento"]}
            onOpen={handleOpen}
          />
          <Column
            title="Concluído"
            tasks={grouped["Concluído"]}
            onOpen={handleOpen}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Kanban;

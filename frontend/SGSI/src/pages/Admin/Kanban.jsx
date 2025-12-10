import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import Acao from "../../components/Cards/Acao";
import { useNavigate } from "react-router-dom";
import Lista from "../../components/Inputs/Lista";
import ListaSearch from "../../components/Inputs/ListaSearch";
import { PRIORIDADE_DATA } from "../../utils/menus";
import { UserContext } from "../../context/userContext";

const Column = ({ title, tasks, onOpen }) => {
  return (
    <div className="bg-white border border-gray-200/60 rounded-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>
      <div className="flex-1 flex flex-col gap-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded">
            Nenhuma ação encontrada.
          </div>
        ) : (
          tasks.map((item) => (
            <div key={item._id} className="h-[280px]">
              <Acao
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
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedPrioridade, setSelectedPrioridade] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [companyOptions, setCompanyOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
      };
      if (selectedUser !== "All") params.responsavel = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;

      const response = await axiosReq.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });
      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // initial tasks fetch happens via dependency effect below

  // fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await axiosReq.get(API_PATHS.USERS.GET_ALL_USERS);
      const opts = [{ label: "Todos", value: "All" }].concat(
        (res.data || []).map((u) => ({
          label: u.name,
          value: u._id,
          avatar: u.profileImageUrl,
        }))
      );
      setUserOptions(opts);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosReq.get(API_PATHS.COMPANIES.LIST);
      const opts = [{ label: "Todos", value: "All" }].concat(
        (res.data || []).map((c) => ({
          label: c.name,
          value: c._id,
        }))
      );
      setCompanyOptions(opts);
    } catch (e) {
      console.error("Error fetching companies:", e);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser, selectedCompany]);

  const grouped = useMemo(() => {
    const source =
      selectedPrioridade === "All"
        ? tasks
        : tasks.filter((t) => t.prioridade === selectedPrioridade);
    const by = { "NIST CSF": [], "ISO 27001": [] };
    for (const t of source) {
      const key = t.classification;
      if (by[key]) by[key].push(t);
    }
    return by;
  }, [tasks, selectedPrioridade]);

  const handleOpen = (taskId) => {
    if (user?.role === "admin") {
      navigate(`/admin/acao-modal`, { state: { taskId } });
    } else {
      navigate(`/user/task-details/${taskId}`);
    }
  };

  return (
    <DashboardLayout activeMenu="Kanban">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full lg:w-[880px]">
            {user?.role === "admin" && (
              <div className="w-full md:w-[210px]">
                <label className="text-xs font-medium text-slate-600">
                  Responsável
                </label>
                <ListaSearch
                  options={userOptions}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="All Users"
                  showAvatar
                />
              </div>
            )}
            <div className="w-full md:w-[210px]">
              <label className="text-xs font-medium text-slate-600">
                Status
              </label>
              <Lista
                options={[
                  { label: "Todos", value: "All" },
                  { label: "Pendente", value: "Pendente" },
                  { label: "Em Andamento", value: "Em Andamento" },
                  { label: "Concluído", value: "Concluído" },
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="All Statuses"
              />
            </div>
            <div className="w-full md:w-[210px]">
              <label className="text-xs font-medium text-slate-600">
                Prioridade
              </label>
              <Lista
                options={[{ label: "Todos", value: "All" }, ...PRIORIDADE_DATA]}
                value={selectedPrioridade}
                onChange={setSelectedPrioridade}
                placeholder="All Priorities"
              />
            </div>
            {user?.role === "admin" && (
              <div className="w-full md:w-[210px]">
                <label className="text-xs font-medium text-slate-600">
                  Cliente
                </label>
                <Lista
                  options={companyOptions}
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  placeholder="Todos os clientes"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Column
            title="NIST CSF"
            tasks={grouped["NIST CSF"]}
            onOpen={handleOpen}
          />
          <Column
            title="ISO 27001"
            tasks={grouped["ISO 27001"]}
            onOpen={handleOpen}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Kanban;

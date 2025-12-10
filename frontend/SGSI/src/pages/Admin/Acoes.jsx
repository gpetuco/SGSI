import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import Acao from "../../components/Cards/Acao";
import Lista from "../../components/Inputs/Lista";
import ListaSearch from "../../components/Inputs/ListaSearch";
import { CLASSIFICATION_DATA, PRIORIDADE_DATA } from "../../utils/menus";
import { UserContext } from "../../context/userContext";

const Acoes = () => {
  const [allTasks, setAllTasks] = useState([]);

  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedFramework, setSelectedFramework] = useState("All");
  const [selectedPrioridade, setSelectedPrioridade] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
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
      if (selectedFramework !== "All")
        params.classification = selectedFramework;
      if (selectedUser !== "All") params.responsavel = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;

      const response = await axiosReq.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleClick = (taskData) => {
    if (user?.role === "admin") {
      navigate(`/admin/acao-modal`, { state: { taskId: taskData._id } });
    } else {
      navigate(`/user/task-details/${taskData._id}`);
    }
  };

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
    getAllTasks(filterStatus);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedFramework, selectedUser, selectedCompany]);

  return (
    <DashboardLayout activeMenu="Ações">
      <div className="my-5">
        <h2 className="text-xl md:text-xl font-medium">Ações</h2>

        <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 w-full">
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
            {user?.role === "admin" && (
              <div className="w-full md:w-[190px]">
                <label className="text-xs font-medium text-slate-600">
                  Responsável
                </label>
                <ListaSearch
                  options={userOptions}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Todos"
                  showAvatar
                />
              </div>
            )}
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">
                Classificação
              </label>
              <Lista
                options={[
                  { label: "Todos", value: "All" },
                  ...CLASSIFICATION_DATA,
                ]}
                value={selectedFramework}
                onChange={setSelectedFramework}
                placeholder="Todos"
              />
            </div>
            <div className="w-full md:w-[190px]">
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
                placeholder="Todos"
              />
            </div>
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">
                Prioridade
              </label>
              <Lista
                options={[{ label: "Todos", value: "All" }, ...PRIORIDADE_DATA]}
                value={selectedPrioridade}
                onChange={setSelectedPrioridade}
                placeholder="Todas"
              />
            </div>
            {user?.role === "admin" && (
              <div className="w-full md:w-[190px]">
                <label className="text-xs font-medium text-slate-600">
                  Cliente
                </label>
                <Lista
                  options={companyOptions}
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  placeholder="Todos"
                />
              </div>
            )}
          </div>

          {/* Botão Criar alinhado à direita, mesmo tamanho dos selects */}
          {user?.role === "admin" && (
            <div className="w-full md:w-[190px]">
              <button
                className="w-full text-sm font-medium text-white bg-primary px-2.5 py-3 rounded-md mt-2 hover:bg-primary/90 transition-colors"
                onClick={() => navigate("/admin/acao-modal")}
              >
                + Criar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {(selectedPrioridade === "All"
            ? allTasks
            : allTasks.filter((t) => t.prioridade === selectedPrioridade)
          )?.map((item) => (
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
              responsavel={item.responsavel?.map(
                (member) => member.profileImageUrl
              )}
              concluidoTodoCount={item.concluidoTodoCount || 0}
              itens={item.itens || []}
              clienteName={item.cliente?.name}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Acoes;

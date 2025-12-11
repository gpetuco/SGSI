import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import Acao from "../../components/Panels/Acao";
import { useNavigate } from "react-router-dom";
import Lista from "../../components/Inputs/Lista";
import ListaSearch from "../../components/Inputs/ListaSearch";
import { PRIORIDADE_DATA } from "../../utils/menus";
import { UserContext } from "../../context/userContext";

const Column = ({ title, acoes, onOpen }) => {
  return (
    <div className="bg-white border border-gray-200/60 rounded-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-500">{acoes.length}</span>
      </div>
      <div className="flex-1 flex flex-col gap-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
        {acoes.length === 0 ? (
          <div className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded">
            Nenhuma ação encontrada.
          </div>
        ) : (
          acoes.map((item) => (
            <div key={item._id} className="h-[280px]">
              <Acao
                title={item.title}
                descricao={item.descricao}
                prioridade={item.prioridade}
                classification={item.classification}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                previsao={item.previsao}
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
  const [acoes, setAcoes] = useState([]);
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

  const getAllAcoes = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
      };
      if (selectedUser !== "All") params.responsavel = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;

      const response = await axiosReq.get(URLS_API.ACOES.DADOS_ACOES, {
        params,
      });
      setAcoes(response.data?.acoes || []);
    } catch (error) {
      console.error("Error fetching acoes:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosReq.get(URLS_API.USUARIOS.GET_ALL_USUARIOS);
      const opts = [{ label: "Todos", value: "All" }].concat(
        (res.data || []).map((u) => ({
          label: u.name,
          value: u._id,
          imagemResponsavel: u.profileImageUrl,
        }))
      );
      setUserOptions(opts);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axiosReq.get(URLS_API.CLIENTES.DADOS_CLIENTES);
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
    getAllAcoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser, selectedCompany]);

  const grouped = useMemo(() => {
    const source =
      selectedPrioridade === "All"
        ? acoes
        : acoes.filter((t) => t.prioridade === selectedPrioridade);
    const by = { "NIST CSF": [], "ISO 27001": [] };
    for (const t of source) {
      const key = t.classification;
      if (by[key]) by[key].push(t);
    }
    return by;
  }, [acoes, selectedPrioridade]);

  const handleOpen = (acaoId) => {
    if (user?.role === "admin") {
      navigate(`/admin/acao-popup`, { state: { acaoId } });
    } else {
      navigate(`/user/acao-details/${acaoId}`);
    }
  };

  return (
    <DashboardLayout activeMenu="Kanban">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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
                  showResponsavel
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
            acoes={grouped["NIST CSF"]}
            onOpen={handleOpen}
          />
          <Column
            title="ISO 27001"
            acoes={grouped["ISO 27001"]}
            onOpen={handleOpen}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Kanban;

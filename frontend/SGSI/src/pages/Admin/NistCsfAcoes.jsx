import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import Acao from "../../components/Panels/Acao";
import Lista from "../../components/Inputs/Lista";
import ListaSearch from "../../components/Inputs/ListaSearch";
import { PRIORIDADE_DATA } from "../../utils/menus";
import { UserContext } from "../../context/userContext";

const NistCsfAcoes = () => {
  const [allAcoes, setAllAcoes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPrioridade, setSelectedPrioridade] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const [companyOptions, setCompanyOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);

  const nistFunctionOptions = [
    { label: "Todos", value: "All" },
    { label: "Govern", value: "Govern" },
    { label: "Identify", value: "Identify" },
    { label: "Protect", value: "Protect" },
    { label: "Detect", value: "Detect" },
    { label: "Respond", value: "Respond" },
    { label: "Recover", value: "Recover" },
  ];

  const getNistFunctionFromTitle = (title = "") => {
    const upper = String(title).toUpperCase();
    if (upper.startsWith("GOVERN")) return "Govern";
    if (upper.startsWith("IDENTIFY")) return "Identify";
    if (upper.startsWith("PROTECT")) return "Protect";
    if (upper.startsWith("DETECT")) return "Detect";
    if (upper.startsWith("RESPOND")) return "Respond";
    if (upper.startsWith("RECOVER")) return "Recover";
    return null;
  };

  const getAllAcoes = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
        classification: "NIST CSF",
      };
      if (selectedUser !== "All") params.responsavel = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;
      const response = await axiosReq.get(URLS_API.ACOES.GET_ALL_ACOES, {
        params,
      });

      setAllAcoes(response.data?.acoes?.length > 0 ? response.data.acoes : []);
    } catch (error) {
      console.error("Error fetching acoes:", error);
    }
  };

  // fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await axiosReq.get(URLS_API.USERS.GET_ALL_USERS);
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

  // fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const res = await axiosReq.get(URLS_API.COMPANIES.LIST);
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

  const handleClick = (acaoData) => {
    if (user?.role === "admin") {
      navigate(`/admin/acao-popup`, { state: { acaoId: acaoData._id } });
    } else {
      navigate(`/user/acao-details/${acaoData._id}`);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    getAllAcoes(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser, selectedCompany]);

  return (
    <DashboardLayout activeMenu="NIST CSF">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">NIST CSF</h2>
        </div>

        {/* Filters: User, Status, Prioridade, NIST Function */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-3 w-full lg:w-[1100px]">
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
            <label className="text-xs font-medium text-slate-600">Status</label>
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
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">
              Função NIST
            </label>
            <Lista
              options={nistFunctionOptions}
              value={selectedFunction}
              onChange={setSelectedFunction}
              placeholder="Todas as funções"
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

        <div className="grid grid-cols-1 gap-4 mt-4">
          {(selectedPrioridade === "All"
            ? allAcoes
            : allAcoes.filter((t) => t.prioridade === selectedPrioridade)
          )
            ?.filter((t) => {
              if (selectedFunction === "All") return true;
              return getNistFunctionFromTitle(t.title) === selectedFunction;
            })
            .map((item) => (
              <Acao
                key={item._id}
                title={item.title}
                descricao={item.descricao}
                prioridade={item.prioridade}
                classification={item.classification}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                previsao={item.previsao}
                responsavel={item.responsavel?.map((a) => a.profileImageUrl)}
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

export default NistCsfAcoes;

import React, { useEffect, useState } from "react";
import Home from "../../components/layouts/Home";
import { useNavigate } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import Acao from "../../components/Panels/Acao";
import Lista from "../../components/Inputs/Lista";
import ListaSearch from "../../components/Inputs/ListaSearch";
import { PRIORIDADE_DATA } from "../../utils/menus";
import { UserContext } from "../../context/userContext";

const Iso27001Acoes = () => {
  const [allAcoes, setAllAcoes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPrioridade, setSelectedPrioridade] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedControlType, setSelectedControlType] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const [companyOptions, setCompanyOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);

  const isoControlTypeOptions = [
    { label: "Todos", value: "All" },
    { label: "Organisational", value: "Organisational" },
    { label: "People", value: "People" },
    { label: "Physical", value: "Physical" },
    { label: "Technological", value: "Technological" },
  ];

  const getIsoControlTypeFromTitle = (title = "") => {
    const upper = String(title).toUpperCase();
    if (upper.startsWith("ORGANISATIONAL CONTROLS")) return "Organisational";
    if (upper.startsWith("PEOPLE CONTROLS")) return "People";
    if (upper.startsWith("PHYSICAL CONTROLS")) return "Physical";
    if (upper.startsWith("TECHNOLOGICAL CONTROLS")) return "Technological";
    return null;
  };

  const getAllAcoes = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
        classification: "ISO 27001",
      };
      if (selectedUser !== "All") params.responsavel = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;
      const response = await axiosReq.get(URLS_API.ACOES.DADOS_ACOES, {
        params,
      });

      setAllAcoes(response.data?.acoes?.length > 0 ? response.data.acoes : []);
    } catch (error) {
      console.error("Error fetching acoes:", error);
    }
  };

  const handleClick = (acaoData) => {
    if (user?.role === "admin") {
      navigate(`/admin/acao-popup`, { state: { acaoId: acaoData._id } });
    } else {
      navigate(`/user/acao-details/${acaoData._id}`);
    }
  };

  // fetch users for dropdown
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
    getAllAcoes(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser, selectedCompany]);

  return (
    <Home activeMenu="ISO 27001">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">ISO 27001</h2>
        </div>

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
              Tipo de Controle
            </label>
            <Lista
              options={isoControlTypeOptions}
              value={selectedControlType}
              onChange={setSelectedControlType}
              placeholder="Todos os tipos"
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
              if (selectedControlType === "All") return true;
              return (
                getIsoControlTypeFromTitle(t.title) === selectedControlType
              );
            })
            .map((item) => (
              <Acao
                key={item._id}
                title={item.title}
                descricao={item.descricao}
                prioridade={item.prioridade}
                classification={item.classification}
                status={item.status}
                progresso={item.progresso}
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
    </Home>
  );
};

export default Iso27001Acoes;

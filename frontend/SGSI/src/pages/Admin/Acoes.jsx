import React, { useEffect, useState } from "react";
import Home from "../../components/layouts/Home";
import { useNavigate } from "react-router-dom";
import ListaSearch from "../../components/Inputs/ListaSearch";
import { CLASSIFICATION_DATA, PRIORIDADE_DATA } from "../../utils/menus";
import { UserContext } from "../../context/sessaoUsuarioContext";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import Acao from "../../components/Panels/Acao";
import Lista from "../../components/Inputs/Lista";

const Acoes = () => {
  const [allAcoes, setAllAcoes] = useState([]);

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

  const getAllAcoes = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
      };
      if (selectedFramework !== "All")
        params.classification = selectedFramework;
      if (selectedUser !== "All") params.responsavel = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;

      const response = await axiosReq.get(URLS_API.ACOES.DADOS_ACOES, {
        params,
      });

      setAllAcoes(response.data?.acoes?.length > 0 ? response.data.acoes : []);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleClick = (acaoData) => {
    if (user?.role === "admin") {
      navigate(`/admin/acao-popup`, { state: { acaoId: acaoData._id } });
    } else {
      navigate(`/user/acao-details/${acaoData._id}`);
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
      console.error("Erro:", e);
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
      console.error("Erro:", e);
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
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedFramework, selectedUser, selectedCompany]);

  return (
    <Home activeMenu="Ações">
      <div className="my-5">
        <h2 className="text-xl md:text-xl font-medium">Ações</h2>

        <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 w-full">
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
                  showResponsavel
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

          {user?.role === "admin" && (
            <div className="w-full md:w-[190px]">
              <button
                className="rounded-md mt-2 hover:bg-primary/90 transition-colors w-full text-sm font-medium text-white bg-primary px-2.5 py-3 "
                onClick={() => navigate("/admin/acao-popup")}
              >
                + Criar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {(selectedPrioridade === "All"
            ? allAcoes
            : allAcoes.filter((t) => t.prioridade === selectedPrioridade)
          )?.map((item) => (
            <Acao
              key={item._id}
              title={item.title}
              descricao={item.descricao}
              prioridade={item.prioridade}
              classification={item.classification}
              status={item.status}
              progresso={item.progresso}
              dataCriacao={item.dataCriacao}
              previsao={item.previsao}
              responsavel={item.responsavel?.map(
                (member) => member.profileImageUrl
              )}
              itensConcluidos={item.itensConcluidos || 0}
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

export default Acoes;

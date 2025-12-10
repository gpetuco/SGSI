import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import FotosUsuarios from "../../components/FotosUsuarios";
import moment from "moment";
import { UserContext } from "../../context/userContext";

const AcaoDetalhar = () => {
  const { id } = useParams();
  const [acao, setAcao] = useState(null);
  const [openModal, setOpenModal] = useState(true);
  const { user } = React.useContext(UserContext);

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Em Andamento":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";

      case "Concluído":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";

      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Em Andamento":
        return "Em Andamento";
      case "Concluído":
        return "Concluído";
      case "Pendente":
      default:
        return "Pendente";
    }
  };

  const getPrioridadeLabel = (prioridade) => {
    switch (prioridade) {
      case "Baixa":
        return "Baixa";
      case "Media":
        return "Média";
      case "Alta":
      default:
        return "Alta";
    }
  };

  // get Acao info by ID
  const getAcaoDetailsByID = async () => {
    try {
      const response = await axiosReq.get(API_PATHS.ACOES.GET_ACAO_BY_ID(id));

      if (response.data) {
        const acaoInfo = response.data;
        setAcao(acaoInfo);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const updateItens = async (index) => {
    if (user?.role === "member") {
      return;
    }

    // eslint-disable-next-line no-unsafe-optional-chaining
    const itens = [...acao?.itens];
    const acaoId = id;

    if (itens && itens[index]) {
      itens[index].concluido = !itens[index].concluido;

      try {
        const response = await axiosReq.put(
          API_PATHS.ACOES.UPDATE_TODO_CHECKLIST(acaoId),
          { itens }
        );
        if (response.status === 200) {
          setAcao(response.data?.acao || acao);
        } else {
          itens[index].concluido = !itens[index].concluido;
        }
      } catch (error) {
        itens[index].concluido = !itens[index].concluido;
      }
    }
  };

  useEffect(() => {
    if (id) {
      getAcaoDetailsByID();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const closeAndGoBack = () => {
    setOpenModal(false);
    setTimeout(() => window.history.back(), 0);
  };

  return (
    <DashboardLayout activeMenu="My Acoes">
      <Modal
        isOpen={openModal}
        onClose={closeAndGoBack}
        title={"Ação"}
        variant="wide"
      >
        {acao && (
          <div className="grid grid-cols-1 mt-1">
            <div className="form-card">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">
                  {acao?.title}
                </h2>
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    acao?.status
                  )} px-4 py-0.5 rounded whitespace-nowrap`}
                >
                  {getStatusLabel(acao?.status)}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox label="Descrição" value={acao?.descricao} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Prioridade"
                    value={getPrioridadeLabel(acao?.prioridade)}
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Previsto"
                    value={
                      acao?.dueDate
                        ? moment(acao?.dueDate).format("DD/MM/YYYY")
                        : "N/A"
                    }
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Itens
                </label>
                {acao?.itens?.map((item, index) => (
                  <Itens
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item?.concluido}
                    readOnly={user?.role === "member"}
                    onChange={() => updateItens(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AcaoDetalhar;

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>

      <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
        {value}
      </p>
    </>
  );
};

const Itens = ({ text, isChecked, onChange, readOnly }) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={readOnly ? undefined : onChange}
        disabled={readOnly}
        className={`w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none ${
          readOnly ? "cursor-default" : "cursor-pointer"
        }`}
      />

      <p className="text-[13px] text-gray-800">{text}</p>
    </div>
  );
};

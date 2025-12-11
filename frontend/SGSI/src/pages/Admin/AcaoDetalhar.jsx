import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import Home from "../../components/layouts/Home";
import Popup from "../../components/Popup";
import moment from "moment";
import { UserContext } from "../../context/sessaoUsuarioContext";

const AcaoDetalhar = () => {
  const { id } = useParams();
  const [acao, setAcao] = useState(null);
  const [openPopup, setOpenPopup] = useState(true);
  const { user } = React.useContext(UserContext);

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
          URLS_API.ACOES.ATUALIZAR_ITENS_FEITOS(acaoId),
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

  const getCorStatus = (status) => {
    switch (status) {
      case "Em Andamento":
        return "bg-cyan-50 border-cyan-500/10 text-cyan-500 border";

      case "Concluído":
        return "bg-lime-50 text-lime-500 border-lime-500/20 border";

      default:
        return "bg-violet-50 border text-violet-500 border-violet-500/10";
    }
  };

  const getAcaoDetailsByID = async () => {
    try {
      const response = await axiosReq.get(URLS_API.ACOES.ACAO_DETALHE(id));

      if (response.data) {
        const acaoInfo = response.data;
        setAcao(acaoInfo);
      }
    } catch (error) {
      console.error("Erro:", error);
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
    setOpenPopup(false);
    setTimeout(() => window.history.back(), 0);
  };

  return (
    <Home activeMenu="My Acoes">
      <Popup
        aberto={openPopup}
        onClose={closeAndGoBack}
        title={"Ação"}
        variant="wide"
      >
        {acao && (
          <div className="grid-cols-1 grid mt-1">
            <div className="form-content-box">
              <div className="items-center justify-between flex">
                <h2 className="font-medium md:text-xl text-sm">
                  {acao?.title}
                </h2>
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getCorStatus(
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
                      acao?.previsao
                        ? moment(acao?.previsao).format("DD/MM/YYYY")
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
      </Popup>
    </Home>
  );
};

export default AcaoDetalhar;

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="font-medium text-slate-500 text-xs">{label}</label>

      <p className="md:text-[13px] mt-0.5 font-medium text-gray-700 text-[12px]">
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
        className={` bg-gray-100 border-gray-300 w-4 h-4 text-primary rounded-sm outline-none ${
          readOnly ? "cursor-default" : "cursor-pointer"
        }`}
      />

      <p className="text-[13px] text-gray-800">{text}</p>
    </div>
  );
};

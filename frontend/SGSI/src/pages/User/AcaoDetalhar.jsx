import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import Home from "../../components/layouts/Home";
import Popup from "../../components/Popup";
import FotosUsuarios from "../../components/FotosUsuarios";
import moment from "moment";

const AcaoDetalhar = () => {
  const { id } = useParams();
  const [acao, setAcao] = useState(null);
  const [openPopup, setOpenPopup] = useState(true);

  const getCorStatus = (status) => {
    switch (status) {
      case "Em Andamento":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";

      case "Concluído":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";

      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
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

  const updateItens = async (index) => {
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
        title={acao?.title || "Acao Details"}
        variant="wide"
      >
        {acao && (
          <div className="mt-1 grid-cols-1 grid">
            <div className="form-content-box">
              <div className="items-center justify-between flex">
                <h2 className="font-medium md:text-xl text-sm">
                  {acao?.title}
                </h2>
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getCorStatus(
                    acao?.status
                  )} px-4 py-0.5 rounded`}
                >
                  {acao?.status}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox label="Descrição" value={acao?.descricao} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Prioridade" value={acao?.prioridade} />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Previsto"
                    value={
                      acao?.previsao
                        ? moment(acao?.previsao).format("Do MMM YYYY")
                        : "N/A"
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>
                  <FotosUsuarios
                    fotosPerfilUsuario={
                      acao?.responsavel?.map((item) => item?.profileImageUrl) ||
                      []
                    }
                    mostra={5}
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
      <label className="text-xs font-medium text-slate-500">{label}</label>

      <p className="font-medium text-gray-700 md:text-[13px] mt-0.5 text-[12px]">
        {value}
      </p>
    </>
  );
};

const Itens = ({ text, isChecked, onChange }) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        className="text-primary border-gray-300 rounded-sm cursor-pointer bg-gray-100 outline-none w-4 h-4"
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
      />

      <p className="text-[13px] text-gray-800">{text}</p>
    </div>
  );
};

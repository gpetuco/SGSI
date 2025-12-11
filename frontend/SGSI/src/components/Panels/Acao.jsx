import React from "react";
import Progress from "../Progress";
import FotosUsuarios from "../FotosUsuarios";
import moment from "moment";
import { UserContext } from "../../context/userContext";

const Acao = ({
  title,
  descricao,
  prioridade,
  classification,
  status,
  progress,
  createdAt,
  previsao,
  responsavel,
  concluidoTodoCount,
  itens,
  onClick,
  className,
  clienteName,
}) => {
  const { user } = React.useContext(UserContext);

  const getPrioridadeLabel = () => {
    switch (prioridade) {
      case "Baixa":
        return "Baixa Prioridade";
      case "Media":
        return "Média Prioridade";
      case "Alta":
      default:
        return "Alta Prioridade";
    }
  };

  const getPrioridadeTagColor = () => {
    switch (prioridade) {
      case "Baixa":
        return "dark:border-emerald-400/20 border-emerald-500/10 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 border dark:text-emerald-300";

      case "Media":
        return "border-amber-500/10 text-amber-600 dark:border-amber-400/20 border bg-amber-50 dark:text-amber-300 dark:bg-amber-900/25";

      default:
        return "dark:bg-rose-900/25 border bg-rose-50 dark:border-rose-400/20 text-rose-600 border-rose-500/10 dark:text-rose-300";
    }
  };

  const getLabelStatus = () => {
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

  const getCorStatus = () => {
    switch (status) {
      case "Em Andamento":
        return "border dark:border-cyan-400/20 bg-cyan-50 border-cyan-500/10 dark:text-cyan-300 text-cyan-500 dark:bg-cyan-900/30";

      case "Concluído":
        return "border-lime-500/20 bg-lime-50 dark:border-lime-400/20 text-lime-500 dark:bg-lime-900/25 border dark:text-lime-300";

      default:
        return "dark:border-violet-400/20 bg-violet-50 text-violet-500 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30";
    }
  };

  const getCorClassificacao = () => {
    switch (classification) {
      case "ISO 27001":
        return "border-emerald-500/10 dark:border-emerald-400/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 border dark:text-emerald-300";

      case "NIST CSF":
        return "dark:text-blue-300 border-blue-500/10 bg-blue-50 text-blue-600 border dark:bg-blue-900/25 dark:border-blue-400/20";

      default:
        return "dark:bg-violet-900/30 bg-violet-50 border text-violet-600 border-violet-500/10 dark:text-violet-300 dark:border-violet-400/20";
    }
  };

  return (
    <div
      className={` flex-col h-full overflow-hidden shadow-gray-100 border border-gray-200/50 bg-white rounded-xl py-4 shadow-md cursor-pointer flex  ${
        className || ""
      }`}
      onClick={onClick}
    >
      <div className="flex-grow px-4">
        <div className="gap-3 items-start flex justify-between">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 md:text-base text-sm text-gray-800 font-medium">
              {title}
            </p>

            <p className="text-xs md:text-[13px] text-gray-500 mt-1.5 line-clamp-2 leading-[18px]">
              {descricao}
            </p>
          </div>

          <div className="gap-1 flex-col items-end flex">
            <div className="gap-1.5 flex-wrap justify-end flex">
              <div
                className={`rounded-md whitespace-nowrap font-semibold py-1.5 px-3.5 md:text-[13px] text-[12px] ${getCorStatus()}`}
              >
                {getLabelStatus()}
              </div>
              <div
                className={`text-[12px] md:text-[13px] font-semibold ${getPrioridadeTagColor()} px-3.5 py-1.5 rounded-md whitespace-nowrap`}
              >
                {getPrioridadeLabel()}
              </div>
              {classification && (
                <div
                  className={`text-[12px] md:text-[13px] font-semibold ${getCorClassificacao()} px-3.5 py-1.5 rounded-md whitespace-nowrap`}
                >
                  {classification}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="font-medium mt-3 mb-2 leading-[18px] text-[13px] md:text-[14px]">
          <span className="text-white">Progresso:</span>{" "}
          <span className="dark:text-white font-semibold text-gray-700">
            {`${progress}% (`}
            {concluidoTodoCount} / {itens.length || 0}
            {")"}
          </span>
        </p>

        <Progress progress={progress} status={status} />
      </div>

      <div className="px-4">
        <div className="justify-between flex items-center my-1">
          <div className="flex items-start gap-8">
            {clienteName && (
              <div>
                <label className="text-xs text-gray-500">Cliente</label>
                <p className="text-[13px] truncate font-medium text-gray-900 max-w-[220px]">
                  {clienteName}
                </p>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500">Previsto</label>
              <p className="text-[13px] text-gray-900 font-medium">
                {moment(previsao).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>

          <div className="justify-between flex items-center mt-3">
            {user?.role === "admin" && (
              <FotosUsuarios fotosPerfilUsuario={responsavel || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acao;

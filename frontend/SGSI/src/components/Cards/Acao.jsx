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
  dueDate,
  responsavel,
  concluidoTodoCount,
  itens,
  onClick,
  className,
  clienteName,
}) => {
  const { user } = React.useContext(UserContext);
  const getStatusTagColor = () => {
    switch (status) {
      case "Em Andamento":
        return "border-cyan-500/10 bg-cyan-50 text-cyan-500 border dark:text-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-400/20";

      case "Concluído":
        return "text-lime-500 bg-lime-50 border border-lime-500/20 dark:text-lime-300 dark:bg-lime-900/25 dark:border-lime-400/20";

      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30 dark:border-violet-400/20";
    }
  };

  const getStatusLabel = () => {
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

  const getPrioridadeTagColor = () => {
    switch (prioridade) {
      case "Low":
        return "text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-400/20";

      case "Medium":
        return "text-amber-600 bg-amber-50 border border-amber-500/10 dark:text-amber-300 dark:bg-amber-900/25 dark:border-amber-400/20";

      default:
        return "text-rose-600 bg-rose-50 border border-rose-500/10 dark:text-rose-300 dark:bg-rose-900/25 dark:border-rose-400/20";
    }
  };

  const getPrioridadeLabel = () => {
    switch (prioridade) {
      case "Low":
        return "Baixa Prioridade";
      case "Medium":
        return "Média Prioridade";
      case "High":
      default:
        return "Alta Prioridade";
    }
  };

  const getClassificationTagColor = () => {
    switch (classification) {
      case "ISO 27001":
        return "text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-400/20";
      case "NIST CSF":
        return "text-blue-600 bg-blue-50 border border-blue-500/10 dark:text-blue-300 dark:bg-blue-900/25 dark:border-blue-400/20";
      default:
        return "text-violet-600 bg-violet-50 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30 dark:border-violet-400/20";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer flex flex-col h-full overflow-hidden ${
        className || ""
      }`}
      onClick={onClick}
    >
      <div className="px-4 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-medium text-gray-800 line-clamp-2">
              {title}
            </p>

            <p className="text-xs md:text-[13px] text-gray-500 mt-1.5 line-clamp-2 leading-[18px]">
              {descricao}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap justify-end gap-1.5">
              <div
                className={`text-[12px] md:text-[13px] font-semibold ${getStatusTagColor()} px-3.5 py-1.5 rounded-md whitespace-nowrap`}
              >
                {getStatusLabel()}
              </div>
              <div
                className={`text-[12px] md:text-[13px] font-semibold ${getPrioridadeTagColor()} px-3.5 py-1.5 rounded-md whitespace-nowrap`}
              >
                {getPrioridadeLabel()}
              </div>
              {classification && (
                <div
                  className={`text-[12px] md:text-[13px] font-semibold ${getClassificationTagColor()} px-3.5 py-1.5 rounded-md whitespace-nowrap`}
                >
                  {classification}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-[13px] md:text-[14px] font-medium mt-3 mb-2 leading-[18px]">
          <span className="text-white">Progresso:</span>{" "}
          <span className="font-semibold text-gray-700 dark:text-white">
            {`${progress}% (`}
            {concluidoTodoCount} / {itens.length || 0}
            {")"}
          </span>
        </p>

        <Progress progress={progress} status={status} />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between my-1">
          <div className="flex items-start gap-8">
            {clienteName && (
              <div>
                <label className="text-xs text-gray-500">Cliente</label>
                <p className="text-[13px] font-medium text-gray-900 truncate max-w-[220px]">
                  {clienteName}
                </p>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500">Previsto</label>
              <p className="text-[13px] font-medium text-gray-900">
                {moment(dueDate).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            {user?.role === "admin" && (
              <FotosUsuarios avatars={responsavel || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acao;

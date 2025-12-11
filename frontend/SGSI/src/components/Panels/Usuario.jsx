import React from "react";

const Usuario = ({ dadosUsuarioDetalhesInfo }) => {
  return (
    <div className="p-2 user-content-box">
      <div className="justify-between flex items-center">
        <div className="gap-3 items-center flex">
          <img
            src={dadosUsuarioDetalhesInfo?.profileImageUrl}
            alt={`Foto`}
            className="border-2 h-12 w-12 rounded-full border-white"
          />

          <div>
            <p className="font-medium text-sm ">
              {dadosUsuarioDetalhesInfo?.name}
            </p>
            <p className="text-gray-500 text-xs">
              {dadosUsuarioDetalhesInfo?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mt-5">
        <TagStatus
          label="Pendente"
          count={dadosUsuarioDetalhesInfo?.acoesPendentes || 0}
          status="Pendente"
        />
        <TagStatus
          label="Em Andamento"
          count={dadosUsuarioDetalhesInfo?.acoesEmAndamento || 0}
          status="Em Andamento"
        />
        <TagStatus
          label="Concluído"
          count={dadosUsuarioDetalhesInfo?.acoesConcluidas || 0}
          status="Concluído"
        />
      </div>
    </div>
  );
};

export default Usuario;

const TagStatus = ({ status, count, label }) => {
  const getCorStatus = () => {
    switch (status) {
      case "Em Andamento":
        return "bg-gray-50 text-cyan-500";

      case "Concluído":
        return "bg-gray-50 text-indigo-500";

      default:
        return "bg-gray-50 text-violet-500";
    }
  };

  return (
    <div
      className={`flex-1 text-[10px] font-medium ${getCorStatus()} px-4 py-0.5 rounded `}
    >
      <span className="font-semibold text-[12px]">{count}</span> <br /> {label}
    </div>
  );
};

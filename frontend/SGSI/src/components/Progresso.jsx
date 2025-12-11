import React from "react";

const Progresso = ({ progresso, status }) => {
  const getProgressoCor = () => {
    switch (status) {
      case "Em Andamento":
        return "border-yellow-500/10 text-yellow-500 bg-yellow-500 border";

      case "Concluído":
        return "border border-lime-500/10 bg-lime-500 text-lime-500";

      default:
        return "border-violet-500/10 bg-violet-500 border text-violet-500";
    }
  };

  return (
    <div className="rounded-full dark:bg-gray-700 w-full h-1.5 bg-gray-200">
      <div
        className={`${getProgressoCor()} rounded-full text-center font-medium h-1.5 text-xs`}
        style={{ width: `${progresso}%` }}
      ></div>
    </div>
  );
};

export default Progresso;

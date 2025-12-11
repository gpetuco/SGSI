import React from "react";

const Excluir = ({ onDelete, content }) => {
  return (
    <div>
      <p className="text-sm">{content}</p>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer border text-xs md:text-sm justify-center whitespace-nowrap bg-rose-50 text-rose-500 rounded-lg font-medium gap-1.5 flex items-center border-rose-100 px-4 py-2"
        >
          Apagar
        </button>
      </div>
    </div>
  );
};

export default Excluir;

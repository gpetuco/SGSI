import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

const Lista = ({ options, value, onChange, placeholder }) => {
  const [aberto, setAberto] = useState(false);

  const selecionarOpcao = (option) => {
    onChange(option);
    setAberto(false);
  };

  return (
    <div className="relative w-full">
      <button
        className="border-slate-100 dark:border-slate-500 outline-none rounded-md w-full bg-white dark:bg-slate-700 flex justify-between items-center mt-2 px-2.5 py-3 text-black dark:text-slate-100 text-sm border"
        onClick={() => setAberto(!aberto)}
      >
        {value
          ? options.find((opt) => opt.value === value)?.label
          : placeholder}
        <span className="ml-2">
          {aberto ? (
            <LuChevronDown classNarotate-180me="" />
          ) : (
            <LuChevronDown />
          )}
        </span>
      </button>

      {aberto && (
        <div className="absolute w-full bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 rounded-md mt-1 shadow-md z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => selecionarOpcao(option.value)}
              className="text-black dark:text-slate-100 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lista;

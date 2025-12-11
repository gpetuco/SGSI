import React, { useMemo, useState } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import ImagemUsuario from "../ImagemUsuario";

const ListaSearch = ({
  options = [],
  value,
  onChange,
  placeholder,
  showResponsavel = false,
}) => {
  const [aberto, setAberto] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query]);

  const current = useMemo(() => {
    return options.find((o) => o.value === value);
  }, [options, value]);

  const handleSelect = (val) => {
    onChange(val);
    setAberto(false);
    setQuery("");
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full text-sm text-black dark:text-slate-100 outline-none bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        <span className="flex items-center gap-2 truncate">
          {showResponsavel && (
            <ImagemUsuario
              src={current?.imagemResponsavel}
              name={current?.label}
              size="w-5 h-5"
            />
          )}
          <span className="truncate">{current?.label || placeholder}</span>
        </span>
        <span className="ml-2">
          <LuChevronDown
            className={`${aberto ? "rotate-180" : ""} transition-transform`}
          />
        </span>
      </button>

      {aberto && (
        <div className="absolute w-full bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 rounded-md mt-1 shadow-md z-20">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-500">
            <LuSearch className="text-gray-500 dark:text-slate-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full text-sm outline-none bg-transparent text-black dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
              >
                {showResponsavel && (
                  <ImagemUsuario
                    src={option.imagemResponsavel}
                    name={option.label}
                    size="w-6 h-6"
                  />
                )}
                <span className="truncate text-black dark:text-slate-100">
                  {option.label}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-xs text-gray-500 dark:text-slate-400">
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaSearch;

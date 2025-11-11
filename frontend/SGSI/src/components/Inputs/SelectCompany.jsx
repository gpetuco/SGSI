import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuChevronDown, LuSearch } from "react-icons/lu";

const SelectCompany = ({ value, onChange, placeholder = "Selecione o cliente" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState("");

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.COMPANIES.LIST);
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Falha ao carregar clientes", e);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const selectedLabel = () => {
    const c = companies.find((x) => x._id === value);
    return c ? `${c.name}` : placeholder;
  };

  const filtered = companies.filter((c) =>
    c.name?.toLowerCase().includes(query.toLowerCase()) || c._id?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm text-black dark:text-slate-100 outline-none bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        <span className="truncate text-left">{selectedLabel()}</span>
        <LuChevronDown />
      </button>

      {isOpen && (
        <div className="absolute w-full bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 rounded-md mt-1 shadow-md z-10">
          <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-slate-600">
            <LuSearch className="text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar cliente por nome ou ID"
              className="w-full text-sm bg-transparent outline-none text-black dark:text-white"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => handleSelect(c._id)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-black dark:text-slate-100"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c._id}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">Nenhum cliente encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectCompany;


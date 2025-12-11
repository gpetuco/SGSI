import React, { useEffect, useState } from "react";
import axiosReq from "../../utils/axiosReq";
import { URLS_API } from "../../utils/apiUrl";
import { LuChevronDown, LuSearch } from "react-icons/lu";

const ListaClientes = ({
  value,
  onChange,
  placeholder = "Selecione o cliente",
}) => {
  const [aberto, setAberto] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState("");

  const fetchCompanies = async () => {
    try {
      const res = await axiosReq.get(URLS_API.CLIENTES.DADOS_CLIENTES);
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
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
    c.name?.toLowerCase().includes(query.toLowerCase())
  );

  const selecionarOpcao = (id) => {
    onChange(id);
    setAberto(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full text-sm text-black dark:text-slate-100 outline-none bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        <span className="truncate text-left">{selectedLabel()}</span>
        <LuChevronDown />
      </button>

      {aberto && (
        <div className="absolute w-full bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 rounded-md mt-1 shadow-md z-10">
          <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-slate-600">
            <LuSearch className="text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar cliente por nome"
              className="w-full text-sm bg-transparent outline-none text-black dark:text-white"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => selecionarOpcao(c._id)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-black dark:text-slate-100"
              >
                <div className="font-medium">{c.name}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;

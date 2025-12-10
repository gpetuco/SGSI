import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import toast from "react-hot-toast";
import { LuCopy } from "react-icons/lu";

const Clientes = () => {
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await axiosReq.get(API_PATHS.COMPANIES.LIST);
      setCompanies(res.data || []);
    } catch (err) {
      console.error("Falha ao buscar empresas", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Digite o nome da empresa");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosReq.post(API_PATHS.COMPANIES.CREATE, {
        name: name.trim(),
      });
      // prepend new company
      setCompanies((prev) => [res.data, ...prev]);
      setName("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Não foi possível criar a empresa"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (companyId) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(companyId);
      } else {
        const el = document.createElement("input");
        el.value = companyId;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      toast.success("ID copiado! Use no SignUp.");
    } catch (e) {
      toast.error("Falha ao copiar o ID");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <DashboardLayout activeMenu="Clientes">
      <div className="mt-5 mb-10">
        <h2 className="text-xl md:text-xl font-medium">Clientes</h2>

        <form
          onSubmit={handleCreate}
          className="mt-5 grid grid-cols-1 md:grid-cols-10 gap-3 items-end"
        >
          <div className="md:col-span-8 flex flex-col">
            <label className="text-sm text-white mb-1">Razão Social</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da empresa cliente"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
            />
          </div>

          <div className="md:col-span-2 flex">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Criando..." : "Cadastrar"}
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        <div className="mt-8">
          <div className="overflow-x-auto border border-gray-200/50 rounded-md">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Data de vínculo</th>
                  <th className="px-4 py-2 text-right">Convidar</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {companies.map((c) => (
                  <tr key={c._id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-black">{c.name}</td>
                    <td className="px-4 py-2 text-black">
                      {c.joinDate
                        ? new Date(c.joinDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div class="flex justify-end items-center">
                        <button
                          type="button"
                          onClick={() => handleInvite(c._id)}
                          className="card-btn inline-flex items-center gap-2"
                          title="Copiar ID da empresa para convite"
                        >
                          <LuCopy className="text-base" /> Convidar cliente
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-black" colSpan={3}>
                      Nenhuma empresa cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clientes;

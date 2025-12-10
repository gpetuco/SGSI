import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiUrl";
import axiosReq from "../../utils/axiosReq";
import ImagemUsuario from "../../components/ImagemUsuario";

const Membros = () => {
  const [allUsers, setAllUsers] = useState([]);

  const getUsuarios = async () => {
    try {
      const response = await axiosReq.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsuarios();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Membros">
      <div className="mt-5 mb-10">
        <div className="flex md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">Membros</h2>
        </div>

        <div className="content-box mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left">
                <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[14px]">
                  Membro
                </th>
                <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[14px]">
                  Email
                </th>
                <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[14px]">
                  Pendentes
                </th>
                <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[14px]">
                  Em andamento
                </th>
                <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[14px]">
                  Concluídas
                </th>
              </tr>
            </thead>
            <tbody>
              {allUsers?.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-200 dark:border-slate-700"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ImagemUsuario
                        src={user.profileImageUrl}
                        name={user.name}
                        size="w-7 h-7"
                      />
                      <span className="text-[14px] text-gray-800 dark:text-white">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[14px] text-white">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-gray-800 dark:text-white">
                    {user.acoesPendentes ?? 0}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-gray-800 dark:text-white">
                    {user.acoesEmAndamento ?? 0}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-gray-800 dark:text-white">
                    {user.acoesConcluidas ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Membros;

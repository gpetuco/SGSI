import React, { useEffect, useState } from "react";
import Popup from "../Popup";
import FotosUsuarios from "../FotosUsuarios";
import ImagemUsuario from "../ImagemUsuario";
import { URLS_API } from "../../utils/apiUrl";
import axiosReq from "../../utils/axiosReq";
import { LuUsers } from "react-icons/lu";

const ResponsaveisPopup = ({ selectedUsers, setSelectedUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

  const openPopup = () => {
    setTempSelectedUsers(
      Array.isArray(selectedUsers) ? [...selectedUsers] : []
    );
    setIsPopupOpen(true);
  };

  const getUsuarios = async () => {
    try {
      const response = await axiosReq.get(URLS_API.USUARIOS.GET_ALL_USUARIOS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const selecaoUsuario = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selecionar = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsPopupOpen(false);
  };

  const fotoUsuariosSelecionados = allUsers
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => user.profileImageUrl);

  useEffect(() => {
    getUsuarios();
  }, []);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    }

    return () => {};
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {fotoUsuariosSelecionados.length === 0 && (
        <button className="content-box-btn" onClick={openPopup}>
          <LuUsers className="text-sm" /> Atribuir Responsáveis
        </button>
      )}

      {fotoUsuariosSelecionados.length > 0 && (
        <div className="cursor-pointer" onClick={openPopup}>
          <FotosUsuarios
            fotosPerfilUsuario={fotoUsuariosSelecionados}
            mostra={3}
          />
        </div>
      )}

      <Popup
        aberto={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Atribuir responsáveis"
      >
        <div className="space-y-4 h-[60vh] overflow-y-auto">
          {allUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-3 border-b border-gray-200"
            >
              <ImagemUsuario
                src={user.profileImageUrl}
                name={user.name}
                size="w-10 h-10"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  {user.name}
                </p>
                <p className="text-[13px] text-gray-500">{user.email}</p>
              </div>

              <input
                type="checkbox"
                checked={tempSelectedUsers.includes(user._id)}
                onChange={() => selecaoUsuario(user._id)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            className="content-box-btn"
            onClick={() => setIsPopupOpen(false)}
          >
            Cancelar
          </button>
          <button className="content-box-button" onClick={selecionar}>
            Atribuir
          </button>
        </div>
      </Popup>
    </div>
  );
};

export default ResponsaveisPopup;

import React, { useEffect, useState } from "react";
import { API_PATHS } from "../../utils/apiUrl";
import axiosReq from "../../utils/axiosReq";
import { LuUsers } from "react-icons/lu";
import Modal from "../Modal";
import FotosUsuarios from "../FotosUsuarios";
import ImagemUsuario from "../ImagemUsuario";

const ResponsaveisModal = ({ selectedUsers, setSelectedUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

  const openModal = () => {
    // Preload current selection so users appear checked in the modal
    setTempSelectedUsers(
      Array.isArray(selectedUsers) ? [...selectedUsers] : []
    );
    setIsModalOpen(true);
  };

  const getAllUsers = async () => {
    try {
      const response = await axiosReq.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleUserSelection = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  const selectedImagemUsuarios = allUsers
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => user.profileImageUrl);

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    }

    return () => {};
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {selectedImagemUsuarios.length === 0 && (
        <button className="content-box-btn" onClick={openModal}>
          <LuUsers className="text-sm" /> Atribuir Responsáveis
        </button>
      )}

      {selectedImagemUsuarios.length > 0 && (
        <div className="cursor-pointer" onClick={openModal}>
          <FotosUsuarios avatars={selectedImagemUsuarios} maxVisible={3} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
                onChange={() => toggleUserSelection(user._id)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            className="content-box-btn"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </button>
          <button className="content-box-button" onClick={handleAssign}>
            Atribuir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ResponsaveisModal;

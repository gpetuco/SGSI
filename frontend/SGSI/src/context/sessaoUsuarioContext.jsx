import React, { createContext, useState, useEffect } from "react";
import { URLS_API } from "../utils/apiUrl";
import axiosReq from "../utils/axiosReq";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

const UsuarioPermissaoRole = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) return;

    const tokenUsuario = localStorage.getItem("token");
    if (!tokenUsuario) {
      setLoading(false);
      return;
    }

    const validarUsuarioAcesso = async () => {
      try {
        const response = await axiosReq.get(URLS_API.AUTH.DADOS_PERFIL);
        setUser(response.data);
      } catch (error) {
        console.error("Sem permissao", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    validarUsuarioAcesso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    setLoading(false);
  };

  return (
    <UserContext.Provider
      value={{ user, loading, updateUser, clearUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UsuarioPermissaoRole;

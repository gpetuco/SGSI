import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import ImagemUsuario from "../ImagemUsuario";
import { UserContext } from "../../context/sessaoUsuarioContext";
import { MENU_ADMIN, MENU_CLIENTE } from "../../utils/menus";

const MenuLateral = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [menuLateralData, setMenuLateralData] = useState([]);

  const navigate = useNavigate();

  const detectar = (route) => {
    if (route === "logout") {
      sair();
      return;
    }

    navigate(route);
  };

  const sair = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setMenuLateralData(user?.role === "admin" ? MENU_ADMIN : MENU_CLIENTE);
    }
    return () => {};
  }, [user]);
  return (
    <div className="sticky w-64 top-0 h-screen border-gray-200/50 overflow-y-auto bg-white border-r z-20">
      <div className="justify-center flex-col pt-5 items-center mb-7 flex">
        <div className="relative">
          <ImagemUsuario
            src={user?.profileImageUrl}
            name={user?.name}
            size="w-20 h-20"
          />
        </div>

        {user?.role === "admin" && (
          <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}

        <h5 className="text-gray-950 dark:text-white font-medium leading-6 mt-3">
          {user?.name || ""}
        </h5>
      </div>

      {menuLateralData.map((item, index) => (
        <button
          onClick={() => detectar(item.path)}
          key={`menu_${index}`}
          className={`gap-4 px-6 w-full py-3 flex items-center text-[15px] border-l-4 ${
            activeMenu == item.label
              ? "bg-transparent text-primary dark:text-white border-primary"
              : "hover:text-primary text-gray-700 dark:text-white/80 border-transparent"
          } mb-1 cursor-pointer transition-colors`}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default MenuLateral;

import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import ImagemUsuario from "../ImagemUsuario";
import { UserContext } from "../../context/userContext";
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
    <div className="w-64 h-screen overflow-y-auto bg-white border-r border-gray-200/50 sticky top-0 z-20">
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
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
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] border-l-4 ${
            activeMenu == item.label
              ? "border-primary text-primary dark:text-white bg-transparent"
              : "border-transparent text-gray-700 dark:text-white/80 hover:text-primary"
          } py-3 px-6 mb-1 cursor-pointer transition-colors`}
          onClick={() => detectar(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default MenuLateral;

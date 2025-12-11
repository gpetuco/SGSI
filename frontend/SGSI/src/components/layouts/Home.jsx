import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/sessaoUsuarioContext";
import MenuLateral from "./MenuLateral";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const Home = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  const [menuLateral, setMenuLateral] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("dark")) root.classList.add("dark");
    try {
      localStorage.setItem("theme", "dark");
      // eslint-disable-next-line no-empty
    } catch (_) {}
  }, []);

  return (
    <div className="">
      {user && (
        <div className="flex">
          <div className="max-[1080px]:hidden">
            <MenuLateral activeMenu={activeMenu} />
          </div>

          <button
            className="border-gray-200/30 inline-flex fixed min-[1081px]:hidden justify-center text-white bg-slate-800/60 items-center top-3 left-3 w-10 rounded-md h-10 border z-40"
            aria-label="Open menu"
            onClick={() => setMenuLateral(true)}
          >
            <HiOutlineMenu className="text-2xl" />
          </button>

          <div className="grow mx-5">{children}</div>

          {menuLateral && (
            <div className="fixed inset-0 z-50 min-[1081px]:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMenuLateral(false)}
              />
              <div className="absolute top-0 left-0">
                <MenuLateral activeMenu={activeMenu} />
              </div>
              <button
                className="border absolute justify-center bg-slate-800/80 text-white rounded-md w-10 h-10 inline-flex items-center top-3 left-3 border-gray-200/30"
                aria-label="Close menu"
                onClick={() => setMenuLateral(false)}
              >
                <HiOutlineX className="text-2xl" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

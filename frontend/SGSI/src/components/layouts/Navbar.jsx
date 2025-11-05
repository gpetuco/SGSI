import React, { useEffect, useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  // Ensure dark mode is applied (single theme only)
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("dark")) root.classList.add("dark");
    try {
      localStorage.setItem("theme", "dark");
      // eslint-disable-next-line no-empty
    } catch (_) {}
  }, []);

  return (
    <div className="flex items-center justify-between gap-5 bg-white border boredr-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30">
      <div className="flex items-center gap-5">
        <button
          className="block lg:hidden text-black"
          onClick={() => {
            setOpenSideMenu(!openSideMenu);
          }}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>

        <h2 className="text-lg font-medium text-black dark:text-white">
          Task Manager
        </h2>
      </div>

      {/* Theme toggle removed to keep only dark mode */}

      {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;

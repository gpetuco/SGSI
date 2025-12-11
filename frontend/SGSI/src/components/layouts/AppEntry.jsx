import React from "react";
import IMAGEM from "../../assets/images/auth-img2.png";

const AppEntry = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
        {children}
      </div>

      <div className="bg-no-repeat md:flex justify-center w-[40vw] hidden items-center h-screen bg-center bg-blue-50 overflow-hidden bg-cover p-8">
        <img src={IMAGEM} className="w-64 lg:w-[90%]" />
      </div>
    </div>
  );
};

export default AppEntry;

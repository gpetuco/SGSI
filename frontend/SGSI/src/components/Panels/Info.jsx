import React from "react";

const Info = ({ icon, label, value, color }) => {
  return (
    <div className="gap-3 items-center flex">
      <div className={`md:w-5 w-5 md:h-5 h-5 ${color}`} />

      <p className="md:text-[14px] text-xs text-gray-500">
        <span className="font-semibold text-black md:text-[15px] text-sm">
          {value}
        </span>{" "}
        {label}
      </p>
    </div>
  );
};

export default Info;

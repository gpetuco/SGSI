import React from "react";

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 md:w-5 h-5 md:h-5 ${color}`} />

      <p className="text-xs md:text-[14px] text-gray-500">
        <span className="text-sm md:text-[15px] text-black font-semibold">
          {value}
        </span>{" "}
        {label}
      </p>
    </div>
  );
};

export default InfoCard;

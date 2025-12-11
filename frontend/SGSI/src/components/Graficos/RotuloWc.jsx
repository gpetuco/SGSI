import React from "react";

const RotuloWc = ({ payload }) => {
  return (
    <div className="justify-center flex flex-wrap gap-2 mt-4 space-x-6">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="font-medium text-xs text-gray-700 dark:text-white">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RotuloWc;

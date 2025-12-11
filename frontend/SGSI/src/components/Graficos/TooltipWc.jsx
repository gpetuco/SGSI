import React from "react";

const TooltipWc = ({ payload, active }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border-gray-300 shadow-md bg-white border p-2">
        <p className="text-purple-800 mb-1 font-semibold text-xs">
          {payload[0].name}
        </p>
        <p className="text-gray-600 text-sm">
          Count:{" "}
          <span className="font-medium text-gray-900 text-sm">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default TooltipWc;

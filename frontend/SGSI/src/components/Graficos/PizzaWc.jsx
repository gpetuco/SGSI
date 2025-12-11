import { LuZoomIn } from "react-icons/lu";
import Popup from "../Popup";
import TooltipWc from "./TooltipWc";
import RotuloWc from "./RotuloWc";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import React, { useState } from "react";

const PizzaWc = ({ data, colors, title = "Chart" }) => {
  const [open, setOpen] = useState(false);

  const ChartBody = ({ height = 325 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<TooltipWc />} />
        <Legend content={<RotuloWc />} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="relative group">
      <button
        aria-label="Zoom"
        className="chart-zoom-btn opacity-0 group-hover:opacity-100"
        onClick={() => setOpen(true)}
      >
        <LuZoomIn className="text-lg" />
      </button>
      <ChartBody />
      <Popup
        aberto={open}
        onClose={() => setOpen(false)}
        title={title}
        variant="wide"
      >
        <div style={{ height: "65vh" }}>
          <ChartBody height={"100%"} />
        </div>
      </Popup>
    </div>
  );
};

export default PizzaWc;

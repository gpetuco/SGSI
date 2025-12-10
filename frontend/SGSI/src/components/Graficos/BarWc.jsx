import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Modal from "../Modal";

const BarWc = ({ data }) => {
  const getBarColor = (entry) => {
    switch (entry?.prioridade) {
      case "Baixa":
        return "#00BC7D";

      case "Media":
        return "#FE9900";

      case "Alta":
        return "#FF1F57";

      default:
        return "#00BC7D";
    }
  };

  const TooltipWc = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-700 shadow-md rounded-lg p-2 border border-gray-300 dark:border-slate-500">
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
            {payload[0].payload.prioridade}
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-200">
            \n Count:{" "}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {payload[0].payload.count}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const [open, setOpen] = useState(false);

  const ChartBody = ({ height = 300 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid stroke="none" />

        <XAxis
          dataKey="prioridade"
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />

        <Tooltip content={TooltipWc} cursor={{ fill: "transparent" }} />

        <Bar
          dataKey="count"
          nameKey="prioridade"
          fill="#FF8042"
          radius={[10, 10, 0, 0]}
          activeDot={{ r: 8, fill: "yellow" }}
          activeStyle={{ fill: "green" }}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="relative bg-white mt-6 group">
      <button
        aria-label="Zoom"
        className="chart-zoom-btn opacity-0 group-hover:opacity-100"
        onClick={() => setOpen(true)}
      >
        <LuZoomIn className="text-lg" />
      </button>
      <ChartBody />
      <Modal
        aberto={open}
        onClose={() => setOpen(false)}
        title="Prioridade"
        variant="wide"
      >
        <div style={{ height: "65vh" }}>
          <ChartBody height={"100%"} />
        </div>
      </Modal>
    </div>
  );
};

export default BarWc;

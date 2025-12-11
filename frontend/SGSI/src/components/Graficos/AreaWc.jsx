import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Popup from "../Popup";

const TooltipPadrao = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="border bg-white dark:bg-slate-700 shadow-md rounded-lg border-gray-300 dark:border-slate-500 p-2">
      <p className="text-gray-700 dark:text-white mb-1 text-xs font-semibold">
        {label}
      </p>
      {payload.map((p, idx) => (
        <div key={idx} className="dark:text-slate-200 text-gray-600 text-xs">
          <span
            className="inline-block w-2 h-2 rounded-full mr-2"
            style={{ background: p.color }}
          />
          {p.name}:{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const AreaWc = ({
  data = [],
  areas = [{ dataKey: "value", color: "#1368ec", name: "Value" }],
  xKey = "name",
  height = 325,
  title = "Chart",
}) => {
  const [open, setOpen] = useState(false);

  const ChartBody = ({ h = height }) => (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
          allowDecimals
        />
        <Tooltip
          content={<TooltipPadrao />}
          cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
        />
        <Legend />

        {areas.map((a, i) => (
          <defs key={`defs-${i}`}>
            <linearGradient id={`area-fill-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={a.color || "#1368ec"}
                stopOpacity={0.45}
              />
              <stop
                offset="95%"
                stopColor={a.color || "#1368ec"}
                stopOpacity={0.08}
              />
            </linearGradient>
          </defs>
        ))}

        {areas.map((a, i) => (
          <Area
            key={a.dataKey || i}
            type="monotone"
            dataKey={a.dataKey}
            name={a.name}
            stroke={a.color || "#1368ec"}
            fill={`url(#area-fill-${i})`}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
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
          <ChartBody h={"100%"} />
        </div>
      </Popup>
    </div>
  );
};

export default AreaWc;

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Popup from "../Popup";

const DefaultTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border-gray-300 dark:border-slate-500 bg-white shadow-md p-2 border dark:bg-slate-700">
      <p className="text-xs mb-1 dark:text-white font-semibold text-gray-700">
        {label}
      </p>
      {payload.map((p, idx) => (
        <div key={idx} className="text-xs text-gray-600 dark:text-slate-200">
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

const LineWc = ({
  data = [],
  lines = [{ dataKey: "value", color: "#1368ec", name: "Value" }],
  xKey = "name",
  title = "Chart",
}) => {
  const [open, setOpen] = useState(false);

  const ChartBody = ({ height = 325 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
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
          content={<DefaultTooltip />}
          cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
        />
        <Legend />
        {lines.map((l, i) => (
          <Line
            key={l.dataKey || i}
            type="monotone"
            dataKey={l.dataKey}
            name={l.name}
            stroke={l.color || "#1368ec"}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
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

export default LineWc;

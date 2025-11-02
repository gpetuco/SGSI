import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  Scatter,
} from "recharts";

const palette = [
  "#8D51FF", // violet
  "#00B8DB", // cyan
  "#7BCE00", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#10B981", // emerald
  "#3B82F6", // blue
];

const ScatterTooltip = ({ active, payload, label, xKey, yKey, zKey }) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const d = p && p.payload ? p.payload : {};
  return (
    <div className="bg-white dark:bg-slate-700 shadow-md rounded-lg p-2 border border-gray-300 dark:border-slate-500">
      {d && d.__group && (
        <p className="text-xs font-semibold text-gray-700 dark:text-white mb-1">{String(d.__group)}</p>
      )}
      <div className="text-xs text-gray-600 dark:text-slate-200">
        <div>
          <span className="text-gray-500 dark:text-slate-300">{xKey}: </span>
          <span className="font-medium text-gray-900 dark:text-white">{d[xKey]}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-slate-300">{yKey}: </span>
          <span className="font-medium text-gray-900 dark:text-white">{d[yKey]}</span>
        </div>
        {zKey ? (
          <div>
            <span className="text-gray-500 dark:text-slate-300">{zKey}: </span>
            <span className="font-medium text-gray-900 dark:text-white">{d[zKey]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Props
// - data: array of points
// - xKey: string (default 'x')
// - yKey: string (default 'y')
// - zKey: string (optional, bubble size)
// - groupKey: string (optional, creates one series per group)
// - colors: string[] (optional)
// - height: number (default 320)
// - xLabel, yLabel: string (optional)
const CustomScatterChart = ({
  data = [],
  xKey = "x",
  yKey = "y",
  zKey,
  groupKey,
  colors = palette,
  height = 320,
  xLabel,
  yLabel,
}) => {
  const grouped = useMemo(() => {
    if (!groupKey) return { All: data.map((d) => ({ ...d, __group: "All" })) };
    return data.reduce((acc, item) => {
      const g = item[groupKey] ?? "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push({ ...item, __group: g });
      return acc;
    }, {});
  }, [data, groupKey]);

  const series = Object.keys(grouped);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          name={xLabel || xKey}
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        <YAxis
          dataKey={yKey}
          name={yLabel || yKey}
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        {zKey && <ZAxis dataKey={zKey} range={[40, 200]} />}
        <Tooltip
          cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
          content={<ScatterTooltip xKey={xKey} yKey={yKey} zKey={zKey} />}
        />
        <Legend />
        {series.map((name, idx) => (
          <Scatter
            key={name}
            name={name}
            data={grouped[name]}
            fill={colors[idx % colors.length]}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default CustomScatterChart;


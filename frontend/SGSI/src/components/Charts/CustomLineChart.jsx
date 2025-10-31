import React from "react";
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

const DefaultTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-slate-700 shadow-md rounded-lg p-2 border border-gray-300 dark:border-slate-500">
      <p className="text-xs font-semibold text-gray-700 dark:text-white mb-1">{label}</p>
      {payload.map((p, idx) => (
        <div key={idx} className="text-xs text-gray-600 dark:text-slate-200">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-gray-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// props:
// - data: array of objects
// - lines: [{ dataKey, color, name }]
// - xKey: string (default: 'name')
const CustomLineChart = ({ data = [], lines = [{ dataKey: "value", color: "#1368ec", name: "Value" }], xKey = "name" }) => {
  return (
    <ResponsiveContainer width="100%" height={325}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--sgsi-text-muted)' }} stroke="none" />
        <YAxis tick={{ fontSize: 12, fill: 'var(--sgsi-text-muted)' }} stroke="none" allowDecimals />
        <Tooltip content={<DefaultTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} />
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
};

export default CustomLineChart;


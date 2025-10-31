import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const darken = (hex, amt = -20) => {
  try {
    let usePound = false;
    let color = hex;
    if (color[0] === "#") { usePound = true; color = color.slice(1); }
    const num = parseInt(color, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
    return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  } catch (e) {
    return hex;
  }
};

const DefaultTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-white dark:bg-slate-700 shadow-md rounded-lg p-2 border border-gray-300 dark:border-slate-500">
      <p className="text-xs font-semibold text-gray-700 dark:text-white mb-1">{p?.payload?.status || p?.name}</p>
      <p className="text-sm text-gray-600 dark:text-slate-200">Count: <span className="font-medium text-gray-900 dark:text-white">{p?.value}</span></p>
    </div>
  );
};

// Props: data [{status, count}], colors []
const CustomPie3D = ({ data = [], colors = ["#8D51FF", "#00B8DB", "#7BCE00"] }) => {
  const depthColors = useMemo(() => colors.map((c) => darken(c, -35)), [colors]);

  return (
    <ResponsiveContainer width="100%" height={340}>
      <PieChart>
        {/* depth layer */}
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="52%"
          innerRadius={100}
          outerRadius={140}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-depth-${index}`} fill={depthColors[index % depthColors.length]} opacity={0.35} />
          ))}
        </Pie>

        {/* top layer */}
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="48%"
          innerRadius={80}
          outerRadius={120}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-top-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>

        <Tooltip content={<DefaultTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPie3D;


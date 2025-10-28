import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const StackedStatusByFramework = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={325}>
      <BarChart data={data} barCategoryGap="20%" barGap={6}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="framework" tick={{ fontSize: 12, fill: 'var(--sgsi-text-muted)' }} stroke="none" />
        <YAxis tick={{ fontSize: 12, fill: 'var(--sgsi-text-muted)' }} stroke="none" allowDecimals={false} />
        <Tooltip />
        <Legend />
        {/* Side-by-side bars for each status */}
        <Bar dataKey="Pending" fill="#8D51FF" radius={[6,6,0,0]} />
        <Bar dataKey="InProgress" fill="#00B8DB" radius={[6,6,0,0]} />
        <Bar dataKey="Completed" fill="#7BCE00" radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StackedStatusByFramework;


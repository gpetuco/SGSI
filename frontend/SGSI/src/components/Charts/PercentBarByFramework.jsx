import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts";

const PercentBarByFramework = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={325}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="framework" tick={{ fontSize: 12, fill: 'var(--sgsi-text-muted)' }} stroke="none" />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: 'var(--sgsi-text-muted)' }} stroke="none" />
        <Tooltip formatter={(v) => `${v}%`} />
        <Bar dataKey="percent" fill="#1368ec" radius={[8,8,0,0]}>
          <LabelList dataKey="percent" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PercentBarByFramework;



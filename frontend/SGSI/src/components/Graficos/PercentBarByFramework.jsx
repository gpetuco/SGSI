import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Modal from "../Modal";

const PercentBarByFramework = ({
  data,
  title = "Progresso (%) por Framework",
}) => {
  const [open, setOpen] = useState(false);

  const ChartBody = ({ height = 325 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="framework"
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        <Tooltip formatter={(v) => `${v}%`} />
        <Bar dataKey="percent" fill="#1368ec" radius={[8, 8, 0, 0]}>
          <LabelList
            dataKey="percent"
            position="top"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 12 }}
          />
        </Bar>
      </BarChart>
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
      <Modal
        aberto={open}
        onClose={() => setOpen(false)}
        title={title}
        variant="wide"
      >
        <div style={{ height: "65vh" }}>
          <ChartBody height={"100%"} />
        </div>
      </Modal>
    </div>
  );
};

export default PercentBarByFramework;

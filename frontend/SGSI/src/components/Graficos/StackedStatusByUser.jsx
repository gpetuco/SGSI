import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { LuZoomIn } from "react-icons/lu";
import Modal from "../Modal";

const StackedStatusByUser = ({
  data = [],
  title = "Acoes by User (Top 5)",
}) => {
  const [open, setOpen] = useState(false);

  const ChartBody = ({ height = 325 }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barCategoryGap="20%" barGap={6}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="user"
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--sgsi-text-muted)" }}
          stroke="none"
          allowDecimals={false}
        />
        <Tooltip />
        <Legend />
        {/* Side-by-side grouped bars for each status */}
        <Bar
          dataKey="Concluído"
          name="Concluído"
          fill="#7BCE00"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="EmAndamento"
          name="Em Andamento"
          fill="#FACC15"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="Pendente"
          name="Pendente"
          fill="#FF4B4B"
          radius={[6, 6, 0, 0]}
        />
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

export default StackedStatusByUser;

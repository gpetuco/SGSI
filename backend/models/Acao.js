const mongoose = require("mongoose");

const item = new mongoose.Schema({
  text: { type: String, required: true },
  concluido: { type: Boolean, default: false },
});

const acaoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    descricao: { type: String },
    classification: {
      type: String,
      enum: ["NIST CSF", "ISO 27001"],
      default: "NIST CSF",
    },
    prioridade: {
      type: String,
      enum: ["Baixa", "Media", "Alta"],
      default: "Media",
    },
    status: {
      type: String,
      enum: ["Pendente", "Em Andamento", "Concluído"],
      default: "Pendente",
    },
    dueDate: { type: Date, required: true },
    responsavel: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    itens: [item],
    progress: { type: Number, default: 0 },
    concluidoAt: { type: Date },
  },
  { timestamps: true }
);

acaoSchema.pre("save", function (next) {
  try {
    const hasChecklist = Array.isArray(this.itens) && this.itens.length > 0;
    if (hasChecklist) {
      const total = this.itens.length;
      const done = this.itens.filter((t) => !!t.concluido).length;
      const pct = Math.round((done / total) * 100);
      this.progress = pct;

      if (done === 0) {
        if (this.status !== "Pendente") this.status = "Pendente";
        if (this.concluidoAt) this.concluidoAt = null;
      } else if (done < total) {
        if (this.status !== "Em Andamento") this.status = "Em Andamento";
        if (this.concluidoAt) this.concluidoAt = null;
      } else {
        this.status = "Concluído";
        if (!this.concluidoAt) this.concluidoAt = new Date();
      }
    } else {
      if (this.isModified("status") && this.status === "Concluído") {
        this.progress = 100;
        if (!this.concluidoAt) this.concluidoAt = new Date();
      } else {
        this.progress = this.progress || 0;
      }
    }
  } catch (_) {
    // ignore
  }
  next();
});

module.exports = mongoose.model("Acao", acaoSchema);

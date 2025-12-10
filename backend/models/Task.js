const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    descricao: { type: String },
    classification: {
      type: String,
      enum: ["NIST CSF", "ISO 27001"],
      default: "NIST CSF",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    dueDate: { type: Date, required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    itens: [todoSchema],
    progress: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Recalculate progress from itens before save
taskSchema.pre("save", function (next) {
  try {
    const hasChecklist = Array.isArray(this.itens) && this.itens.length > 0;
    if (hasChecklist) {
      const total = this.itens.length;
      const done = this.itens.filter((t) => !!t.completed).length;
      const pct = Math.round((done / total) * 100);
      this.progress = pct;

      if (done === 0) {
        // No items completed: keep task as Pending
        if (this.status !== "Pending") this.status = "Pending";
        if (this.completedAt) this.completedAt = null;
      } else if (done < total) {
        // Some items completed, not all: In Progress
        if (this.status !== "In Progress") this.status = "In Progress";
        if (this.completedAt) this.completedAt = null;
      } else {
        // All items completed
        this.status = "Completed";
        if (!this.completedAt) this.completedAt = new Date();
      }
    } else {
      if (this.isModified("status") && this.status === "Completed") {
        this.progress = 100;
        if (!this.completedAt) this.completedAt = new Date();
      } else {
        this.progress = this.progress || 0;
      }
    }
  } catch (_) {
    // ignore
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);

const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    classification: {
      type: String,
      enum: ["GRC", "ISO 27001", "NIST CSF"],
      default: "GRC",
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
    attachments: [{ type: String }],
    todoChecklist: [todoSchema],
    progress: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Recalculate progress from todoChecklist before save
taskSchema.pre("save", function (next) {
  try {
    if (Array.isArray(this.todoChecklist) && this.todoChecklist.length > 0) {
      const total = this.todoChecklist.length;
      const done = this.todoChecklist.filter((t) => !!t.completed).length;
      const pct = Math.round((done / total) * 100);
      this.progress = pct;
    } else if (this.isModified("status") && this.status === "Completed") {
      // If marked completed and no checklist, set to 100
      this.progress = 100;
    } else if (!Array.isArray(this.todoChecklist) || this.todoChecklist.length === 0) {
      // No checklist -> keep current progress or normalize to 0
      this.progress = this.progress || 0;
    }
  } catch (_) {
    // ignore and continue
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);

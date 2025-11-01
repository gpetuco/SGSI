import React from "react";
import Progress from "../Progress";
import AvatarGroup from "../AvatarGroup";
import { LuPaperclip } from "react-icons/lu";
import moment from "moment";

const TaskCard = ({
  title,
  description,
  priority,
  classification,
  status,
  progress,
  createdAt,
  dueDate,
  assignedTo,
  attachmentCount,
  completedTodoCount,
  todoChecklist,
  onClick,
  className,
}) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10 dark:text-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-400/20";

      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20 dark:text-lime-300 dark:bg-lime-900/25 dark:border-lime-400/20";

      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30 dark:border-violet-400/20";
    }
  };

  const getPriorityTagColor = () => {
    switch (priority) {
      case "Low":
        return "text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-400/20";

      case "Medium":
        return "text-amber-600 bg-amber-50 border border-amber-500/10 dark:text-amber-300 dark:bg-amber-900/25 dark:border-amber-400/20";

      default:
        return "text-rose-600 bg-rose-50 border border-rose-500/10 dark:text-rose-300 dark:bg-rose-900/25 dark:border-rose-400/20";
    }
  };

  const getClassificationTagColor = () => {
    switch (classification) {
      case "ISO 27001":
        return "text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-400/20";
      case "NIST CSF":
        return "text-blue-600 bg-blue-50 border border-blue-500/10 dark:text-blue-300 dark:bg-blue-900/25 dark:border-blue-400/20";
      case "GRC":
      default:
        return "text-violet-600 bg-violet-50 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30 dark:border-violet-400/20";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer flex flex-col h-full overflow-hidden ${className || ""}`}
      onClick={onClick}
    >
      <div className="flex flex-wrap items-center gap-2 px-4 min-w-0">
        <div
          className={`text-[11px] font-medium ${getStatusTagColor()} px-3 py-0.5 rounded whitespace-nowrap`}
        >
          {status}
        </div>
        <div
          className={`text-[11px] font-medium ${getPriorityTagColor()} px-3 py-0.5 rounded whitespace-nowrap`}
        >
          {priority} Priority
        </div>
        {classification && (
          <div
            className={`text-[11px] font-medium ${getClassificationTagColor()} px-3 py-0.5 rounded whitespace-nowrap`}
          >
            {classification}
          </div>
        )}
      </div>

      <div
        className={`px-4 border-l-[3px] ${
          status === "In Progress"
            ? "border-cyan-500"
            : status === "Completed"
            ? "border-indigo-500"
            : "border-violet-500"
        } flex-grow`}
      >
        <p className="text-sm font-medium text-gray-800 mt-4 line-clamp-2">
          {title}
        </p>

        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-[18px]">
          {description}
        </p>

        <p className="text-[13px] text-gray-700/80 dark:text-slate-200 font-medium mt-2 mb-2 leading-[18px]">
          Task Done:{" "}
          <span className="font-semibold text-gray-700 dark:text-white">
            {completedTodoCount} / {todoChecklist.length || 0}
          </span>
        </p>

        <Progress progress={progress} status={status} />
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between my-1">
          <div>
            <label className="text-xs text-gray-500">Inicio</label>
            <p className="text-[13px] font-medium text-gray-900">
              {moment(createdAt).format("Do MMM YYYY")}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500">Previsto</label>
            <p className="text-[13px] font-medium text-gray-900">
              {moment(dueDate).format("Do MMM YYYY")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <AvatarGroup avatars={assignedTo || []} />

          {attachmentCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg">
              <LuPaperclip className="text-primary" />{" "}
              <span className="text-xs text-gray-900 dark:text-blue-200">{attachmentCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;






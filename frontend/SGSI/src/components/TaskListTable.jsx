import React from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";

const TaskListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20 dark:text-lime-300 dark:bg-lime-900/25 dark:border-lime-400/20";
      case "Pending":
        return "text-violet-500 bg-violet-50 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30 dark:border-violet-400/20";
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10 dark:text-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-400/20";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-rose-600 bg-rose-50 border border-rose-500/10 dark:text-rose-300 dark:bg-rose-900/25 dark:border-rose-400/20";
      case "Medium":
        return "text-amber-600 bg-amber-50 border border-amber-500/10 dark:text-amber-300 dark:bg-amber-900/25 dark:border-amber-400/20";
      case "Low":
        return "text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-400/20";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500";
    }
  };

  const getFrameworkBadgeColor = (classification) => {
    switch (classification) {
      case "ISO 27001":
        return "text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-300 dark:bg-emerald-900/25 dark:border-emerald-400/20";
      case "NIST CSF":
        return "text-blue-600 bg-blue-50 border border-blue-500/10 dark:text-blue-300 dark:bg-blue-900/25 dark:border-blue-400/20";
      default:
        return "text-violet-600 bg-violet-50 border border-violet-500/10 dark:text-violet-300 dark:bg-violet-900/30 dark:border-violet-400/20";
    }
  };

  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[13px]">
              Ação
            </th>
            <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[13px]">
              Status
            </th>
            <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[13px]">
              Prioridade
            </th>
            <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[13px]">
              Framework
            </th>
            <th className="py-3 px-4 text-gray-800 dark:text-white font-medium text-[13px]">
              Responsável
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((task) => (
            <tr
              key={task._id}
              onClick={() =>
                navigate(`/admin/create-task`, { state: { taskId: task._id } })
              }
              className="border-t border-gray-200 dark:border-slate-700 row-hover cursor-pointer"
            >
              <td className="py-4 px-4 text-gray-700 dark:text-white text-[13px] truncate">
                {task.title}
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getFrameworkBadgeColor(
                    task.classification
                  )}`}
                >
                  {task.classification || "-"}
                </span>
              </td>
              <td className="py-4 px-4">
                {Array.isArray(task.assignedTo) &&
                task.assignedTo.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={task.assignedTo[0]?.profileImageUrl}
                      name={task.assignedTo[0]?.name}
                      size="w-6 h-6"
                    />
                    <span className="text-[13px] text-gray-700 dark:text-white">
                      {task.assignedTo[0]?.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[13px] text-gray-500 dark:text-slate-300">
                    -
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;

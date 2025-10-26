import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import { useNavigate } from "react-router-dom";

const Column = ({ title, tasks, onOpen }) => {
  return (
    <div className="bg-white border border-gray-200/60 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded">
            No tasks
          </div>
        ) : (
          tasks.map((item) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo?.map((p) => p.profileImageUrl)}
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => onOpen(item._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const Kanban = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const getMyTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getMyTasks();
    return () => {};
  }, []);

  const grouped = useMemo(() => {
    const by = { Pending: [], "In Progress": [], Completed: [] };
    for (const t of tasks) {
      if (by[t.status]) by[t.status].push(t);
    }
    return by;
  }, [tasks]);

  const handleOpen = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  return (
    <DashboardLayout activeMenu="Kanban">
      <div className="my-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Kanban</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Column title="Pending" tasks={grouped["Pending"]} onOpen={handleOpen} />
          <Column title="In Progress" tasks={grouped["In Progress"]} onOpen={handleOpen} />
          <Column title="Completed" tasks={grouped["Completed"]} onOpen={handleOpen} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Kanban;


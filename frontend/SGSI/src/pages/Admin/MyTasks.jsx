import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskCard from "../../components/Cards/TaskCard";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import { PRIORITY_DATA, CLASSIFICATION_DATA } from "../../utils/data";

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);

  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedFramework, setSelectedFramework] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
        assignedTo: "me",
      };
      if (selectedFramework !== "All")
        params.classification = selectedFramework;
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // removed TaskStatusTabs, no need to compute tabs
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleClick = (taskId) => {
    navigate(`/admin/create-task`, { state: { taskId } });
  };

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedFramework]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>
        </div>

        {/* Filters: Framework, Status, Priority (no User here) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 w-full lg:w-[660px]">
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">
              Framework
            </label>
            <SelectDropdown
              options={[{ label: "All", value: "All" }, ...CLASSIFICATION_DATA]}
              value={selectedFramework}
              onChange={setSelectedFramework}
              placeholder="All Frameworks"
            />
          </div>
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">Status</label>
            <SelectDropdown
              options={[
                { label: "All", value: "All" },
                { label: "Pending", value: "Pending" },
                { label: "In Progress", value: "In Progress" },
                { label: "Completed", value: "Completed" },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="All Statuses"
            />
          </div>
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">
              Priority
            </label>
            <SelectDropdown
              options={[{ label: "All", value: "All" }, ...PRIORITY_DATA]}
              value={selectedPriority}
              onChange={setSelectedPriority}
              placeholder="All Priorities"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {(selectedPriority === "All"
            ? allTasks
            : allTasks.filter((t) => t.priority === selectedPriority)
          )?.map((item, index) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              classification={item.classification}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo?.map(
                (member) => member.profileImageUrl
              )}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              clienteName={item.cliente?.name}
              onClick={() => {
                handleClick(item._id);
              }}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;

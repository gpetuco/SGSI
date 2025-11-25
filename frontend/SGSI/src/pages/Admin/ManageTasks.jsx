import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskCard from "../../components/Cards/TaskCard";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectDropdownSearch from "../../components/Inputs/SelectDropdownSearch";
import { CLASSIFICATION_DATA, PRIORITY_DATA } from "../../utils/data";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);

  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedFramework, setSelectedFramework] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
      };
      if (selectedFramework !== "All")
        params.classification = selectedFramework;
      if (selectedUser !== "All") params.assignedTo = selectedUser;

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // no tabs; dropdown handles status filter
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  // fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      const opts = [{ label: "Todos", value: "All" }].concat(
        (res.data || []).map((u) => ({
          label: u.name,
          value: u._id,
          avatar: u.profileImageUrl,
        }))
      );
      setUserOptions(opts);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedFramework, selectedUser]);

  return (
    <DashboardLayout activeMenu="Ações">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full lg:w-[880px]">
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">
                Responsável
              </label>
              <SelectDropdownSearch
                options={userOptions}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="All Users"
                showAvatar
              />
            </div>
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">
                Framework
              </label>
              <SelectDropdown
                options={[
                  { label: "Todos", value: "All" },
                  ...CLASSIFICATION_DATA,
                ]}
                value={selectedFramework}
                onChange={setSelectedFramework}
                placeholder="All Frameworks"
              />
            </div>
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">
                Status
              </label>
              <SelectDropdown
                options={[
                  { label: "Todos", value: "All" },
                  { label: "Pendente", value: "Pending" },
                  { label: "Em Andamento", value: "In Progress" },
                  { label: "Concluído", value: "Completed" },
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="All Statuses"
              />
            </div>
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">
                Prioridade
              </label>
              <SelectDropdown
                options={[{ label: "Todos", value: "All" }, ...PRIORITY_DATA]}
                value={selectedPriority}
                onChange={setSelectedPriority}
                placeholder="All Priorities"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
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
              onClick={() => {
                handleClick(item);
              }}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;

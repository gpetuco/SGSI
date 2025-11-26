import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectDropdownSearch from "../../components/Inputs/SelectDropdownSearch";
import { PRIORITY_DATA } from "../../utils/data";

const NistCsfTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
   const [selectedFunction, setSelectedFunction] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const navigate = useNavigate();

  const nistFunctionOptions = [
    { label: "Todos", value: "All" },
    { label: "Govern", value: "Govern" },
    { label: "Identify", value: "Identify" },
    { label: "Protect", value: "Protect" },
    { label: "Detect", value: "Detect" },
    { label: "Respond", value: "Respond" },
    { label: "Recover", value: "Recover" },
  ];

  const getNistFunctionFromTitle = (title = "") => {
    const upper = String(title).toUpperCase();
    if (upper.startsWith("GOVERN")) return "Govern";
    if (upper.startsWith("IDENTIFY")) return "Identify";
    if (upper.startsWith("PROTECT")) return "Protect";
    if (upper.startsWith("DETECT")) return "Detect";
    if (upper.startsWith("RESPOND")) return "Respond";
    if (upper.startsWith("RECOVER")) return "Recover";
    return null;
  };

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
        classification: "NIST CSF",
      };
      if (selectedUser !== "All") params.assignedTo = selectedUser;
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
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

  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    getAllTasks(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser]);

  return (
    <DashboardLayout activeMenu="NIST CSF">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">NIST CSF</h2>
        </div>

        {/* Filters: User, Status, Priority, NIST Function */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 w-full lg:w-[880px]">
          <div className="w-full md:w-[210px]">
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
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">Status</label>
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
          <div className="w-full md:w-[210px]">
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
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">
              Função NIST
            </label>
            <SelectDropdown
              options={nistFunctionOptions}
              value={selectedFunction}
              onChange={setSelectedFunction}
              placeholder="Todas as funções"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {(selectedPriority === "All"
            ? allTasks
            : allTasks.filter((t) => t.priority === selectedPriority)
          )
            ?.filter((t) => {
              if (selectedFunction === "All") return true;
              return getNistFunctionFromTitle(t.title) === selectedFunction;
            })
            .map((item) => (
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
              assignedTo={item.assignedTo?.map((a) => a.profileImageUrl)}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NistCsfTasks;

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectDropdownSearch from "../../components/Inputs/SelectDropdownSearch";
import { PRIORITY_DATA } from "../../utils/data";
import { UserContext } from "../../context/userContext";

const Iso27001Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedControlType, setSelectedControlType] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [userOptions, setUserOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const [companyOptions, setCompanyOptions] = useState([
    { label: "Todos", value: "All" },
  ]);
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);

  const isoControlTypeOptions = [
    { label: "Todos", value: "All" },
    { label: "Organisational", value: "Organisational" },
    { label: "People", value: "People" },
    { label: "Physical", value: "Physical" },
    { label: "Technological", value: "Technological" },
  ];

  const getIsoControlTypeFromTitle = (title = "") => {
    const upper = String(title).toUpperCase();
    if (upper.startsWith("ORGANISATIONAL CONTROLS")) return "Organisational";
    if (upper.startsWith("PEOPLE CONTROLS")) return "People";
    if (upper.startsWith("PHYSICAL CONTROLS")) return "Physical";
    if (upper.startsWith("TECHNOLOGICAL CONTROLS")) return "Technological";
    return null;
  };

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
        classification: "ISO 27001",
      };
      if (selectedUser !== "All") params.assignedTo = selectedUser;
      if (selectedCompany !== "All") params.cliente = selectedCompany;
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleClick = (taskData) => {
    if (user?.role === "admin") {
      navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
    } else {
      navigate(`/user/task-details/${taskData._id}`);
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

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.COMPANIES.LIST);
      const opts = [{ label: "Todos", value: "All" }].concat(
        (res.data || []).map((c) => ({
          label: c.name,
          value: c._id,
        }))
      );
      setCompanyOptions(opts);
    } catch (e) {
      console.error("Error fetching companies:", e);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    getAllTasks(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser, selectedCompany]);

  return (
    <DashboardLayout activeMenu="ISO 27001">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">ISO 27001</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-3 w-full lg:w-[1100px]">
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
              Tipo de Controle
            </label>
            <SelectDropdown
              options={isoControlTypeOptions}
              value={selectedControlType}
              onChange={setSelectedControlType}
              placeholder="Todos os tipos"
            />
          </div>
          <div className="w-full md:w-[210px]">
            <label className="text-xs font-medium text-slate-600">
              Cliente
            </label>
            <SelectDropdown
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              placeholder="Todos os clientes"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {(selectedPriority === "All"
            ? allTasks
            : allTasks.filter((t) => t.priority === selectedPriority)
          )
            ?.filter((t) => {
              if (selectedControlType === "All") return true;
              return getIsoControlTypeFromTitle(t.title) === selectedControlType;
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
              clienteName={item.cliente?.name}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Iso27001Tasks;

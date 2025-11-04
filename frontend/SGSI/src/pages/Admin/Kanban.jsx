import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import { useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectDropdownSearch from "../../components/Inputs/SelectDropdownSearch";

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
            <div className="h-[280px]">
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
                assignedTo={item.assignedTo?.map((p) => p.profileImageUrl)}
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todoChecklist={item.todoChecklist || []}
                onClick={() => onOpen(item._id)}
                className="h-full"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Kanban = () => {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [userOptions, setUserOptions] = useState([{ label: "All", value: "All" }]);
  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
      };
      if (selectedUser !== "All") params.assignedTo = selectedUser;

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });
      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // initial tasks fetch happens via dependency effect below

  // fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      const opts = [{ label: "All", value: "All" }].concat(
        (res.data || []).map((u) => ({ label: u.name, value: u._id, avatar: u.profileImageUrl }))
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
    getAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedUser]);

  const grouped = useMemo(() => {
    const by = { GRC: [], "ISO 27001": [], "NIST CSF": [] };
    for (const t of tasks) {
      const key = t.classification;
      if (by[key]) by[key].push(t);
    }
    return by;
  }, [tasks]);

  const handleOpen = (taskId) => {
    navigate(`/admin/create-task`, { state: { taskId } });
  };

  return (
    <DashboardLayout activeMenu="Kanban">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full lg:w-[440px]">
            <div className="w-full md:w-[210px]">
              <label className="text-xs font-medium text-slate-600">User</label>
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Column title="GRC" tasks={grouped["GRC"]} onOpen={handleOpen} />
          <Column
            title="ISO 27001"
            tasks={grouped["ISO 27001"]}
            onOpen={handleOpen}
          />
          <Column
            title="NIST CSF"
            tasks={grouped["NIST CSF"]}
            onOpen={handleOpen}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Kanban;

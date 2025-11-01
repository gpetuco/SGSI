import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectDropdownSearch from "../../components/Inputs/SelectDropdownSearch";
import { CLASSIFICATION_DATA } from "../../utils/data";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);

  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedFramework, setSelectedFramework] = useState("All");
  const [userOptions, setUserOptions] = useState([{ label: "All", value: "All" }]);

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const params = {
        status: filterStatus === "All" ? "" : filterStatus,
      };
      if (selectedFramework !== "All") params.classification = selectedFramework;
      if (selectedUser !== "All") params.assignedTo = selectedUser;

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, { params });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Map statusSummary data with fixed labels and order
      const statusSummary = response.data?.statusSummary || {};

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  // download task report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading details:", error);
      // eslint-disable-next-line no-undef
      toast.error("Failed to download details. Please try again.");
    }
  };

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
    getAllTasks(filterStatus);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedFramework, selectedUser]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full lg:w-[440px]">
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">User</label>
              <SelectDropdownSearch
                options={userOptions}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="All Users"
                showAvatar
              />
            </div>
            <div className="w-full md:w-[190px]">
              <label className="text-xs font-medium text-slate-600">Framework</label>
              <SelectDropdown
                options={[{ label: "All", value: "All" }, ...CLASSIFICATION_DATA]}
                value={selectedFramework}
                onChange={setSelectedFramework}
                placeholder="All Frameworks"
              />
            </div>
          </div>

          {/* Right: Status tabs + Download */}
          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3 lg:ml-2 lg:flex-1 lg:justify-end lg:flex-nowrap min-w-0">
              <div className="overflow-x-auto max-w-full flex-1 min-w-0">
                <TaskStatusTabs
                  tabs={tabs}
                  activeTab={filterStatus}
                  setActiveTab={setFilterStatus}
                />
              </div>

              <button className="hidden lg:flex download-btn shrink-0" onClick={handleDownloadReport}>
                <LuFileSpreadsheet className="text-lg" />
                Download Report
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks?.map((item, index) => (
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
              assignedTo={item.assignedTo?.map((member) => member.profileImageUrl)}
              attachmentCount={item.attachments?.length || 0}
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



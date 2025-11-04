import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA, CLASSIFICATION_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectUsers from "../../components/Inputs/SelectUsers";
import TodoListInput from "../../components/Inputs/TodoListInput";
import AddAttachmentsInput from "../../components/Inputs/AddAttachmentsInput";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";

const getStatusTagColor = (status) => {
  switch (status) {
    case "In Progress":
      return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
    case "Completed":
      return "text-lime-500 bg-lime-50 border border-lime-500/20";
    default:
      return "text-violet-500 bg-violet-50 border border-violet-500/10";
  }
};

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();
  const [openFormModal, setOpenFormModal] = useState(true);

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    classification: "GRC",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [checklistEditMode, setChecklistEditMode] = useState(false);
  const editChecklistRef = useRef(null);
  const editInputsRef = useRef([]);
  const [editFocusIndex, setEditFocusIndex] = useState(null);
  const [suppressOutsideOnce, setSuppressOutsideOnce] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    //reset form
    setTaskData({
      title: "",
      description: "",
      classification: "GRC",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  // Create Task
  const createTask = async () => {
    setLoading(true);

    try {
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      });

      toast.success("Task Created Successfully");

      clearData();
    } catch (error) {
      console.error("Error creating task:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Update Task
  const updateTask = async () => {
    setLoading(true);

    try {
      const todolist = taskData.todoChecklist?.map((item) => {
        const prevTodoChecklist = currentTask?.todoChecklist || [];
        const matchedTask = prevTodoChecklist.find((task) => task.text == item);

        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });

      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
          ...taskData,
          dueDate: new Date(taskData.dueDate).toISOString(),
          todoChecklist: todolist,
        }
      );

      toast.success("Task Updated Successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Toggle a checklist item completed state (update status accordingly)
  const toggleChecklistItem = async (index) => {
    if (!taskId) return;
    try {
      const next = Array.isArray(currentTask?.todoChecklist)
        ? [...currentTask.todoChecklist]
        : [];
      if (!next[index]) return;
      next[index] = { ...next[index], completed: !next[index].completed };

      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
        { todoChecklist: next }
      );
      if (response.status === 200) {
        const updated = response.data?.task;
        setCurrentTask(updated);
        setTaskData((prev) => ({
          ...prev,
          todoChecklist: Array.isArray(updated?.todoChecklist)
            ? updated.todoChecklist.map((i) => i.text)
            : [],
        }));
      }
    } catch (e) {
      // silent
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Input validation
    if (!taskData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!taskData.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!taskData.dueDate) {
      setError("Previsto is required.");
      return;
    }

    if (taskData.assignedTo?.length === 0) {
      setError("Task not assigned to any member");
      return;
    }

    if (taskData.todoChecklist?.length === 0) {
      setError("Add atleast one todo task");
      return;
    }

    if (taskId) {
      updateTask();
      return;
    }

    createTask();
  };

  // get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      );

      if (response.data) {
        const taskInfo = response.data;
        setCurrentTask(taskInfo);

        setTaskData((prevState) => ({
          title: taskInfo.title,
          description: taskInfo.description,
          classification: taskInfo.classification || "GRC",
          priority: taskInfo.priority,
          dueDate: taskInfo.dueDate
            ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
            : null,
          assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
          todoChecklist:
            taskInfo?.todoChecklist?.map((item) => item?.text) || [],
          attachments: taskInfo?.attachments || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Commit checklist edits when clicking outside of edit block
  useEffect(() => {
    if (!checklistEditMode) return;
    const handleClickOutside = (e) => {
      if (suppressOutsideOnce) {
        setSuppressOutsideOnce(false);
        return;
      }
      if (editChecklistRef.current && !editChecklistRef.current.contains(e.target)) {
        commitChecklistChanges();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [checklistEditMode, suppressOutsideOnce]);

  // After entering edit mode, focus the targeted input
  useEffect(() => {
    if (checklistEditMode && editFocusIndex !== null) {
      const focus = () => {
        const el = editInputsRef.current?.[editFocusIndex];
        if (el && typeof el.focus === "function") {
          el.focus();
          // place caret at end
          const val = el.value;
          try { el.setSelectionRange(val.length, val.length); } catch (_) {}
        }
      };
      setTimeout(focus, 0);
    }
  }, [checklistEditMode, editFocusIndex]);


  const commitChecklistChanges = async () => {
    if (!taskId) return;
    try {
      const old = Array.isArray(currentTask?.todoChecklist) ? currentTask.todoChecklist : [];
      const byText = new Map(old.map((o) => [o.text, !!o.completed]));
      const updated = (taskData?.todoChecklist || []).map((txt, idx) => ({
        text: txt,
        completed: byText.has(txt) ? byText.get(txt) : !!old[idx]?.completed,
      }));
      const res = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
        { todoChecklist: updated }
      );
      if (res.status === 200) {
        setCurrentTask(res.data?.task);
      }
    } catch (e) {
      // ignore
    } finally {
      setChecklistEditMode(false);
      setEditFocusIndex(null);
      setNewTodoText("");
    }
  };

  const handleEditItemChange = (index, value) => {
    setTaskData((prev) => {
      const next = [...(prev.todoChecklist || [])];
      next[index] = value;
      return { ...prev, todoChecklist: next };
    });
  };

  const enterEditAtIndex = (index) => {
    setTaskData((prev) => ({
      ...prev,
      todoChecklist: Array.isArray(currentTask?.todoChecklist)
        ? currentTask.todoChecklist.map((i) => i.text)
        : prev.todoChecklist,
    }));
    setSuppressOutsideOnce(true);
    setEditFocusIndex(index);
    setChecklistEditMode(true);
  };

  const handleDeleteItem = (index) => {
    setTaskData((prev) => {
      const next = (prev.todoChecklist || []).filter((_, i) => i !== index);
      return { ...prev, todoChecklist: next };
    });
  };

  const handleAddItem = () => {
    const v = newTodoText.trim();
    if (!v) return;
    setTaskData((prev) => ({
      ...prev,
      todoChecklist: [...(prev.todoChecklist || []), v],
    }));
    setNewTodoText("");
  };

  // no-op helpers from previous revert

  // Delete Task
  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));

      setOpenDeleteAlert(false);
      toast.success("Task details deleted successfully");
      navigate("/admin/tasks");
    } catch (error) {
      console.error(
        "Error deleting:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    if (taskId) {
      getTaskDetailsByID(taskId);
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const closeAndGoBack = () => {
    setOpenFormModal(false);
    setTimeout(() => {
      navigate(-1);
    }, 0);
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <Modal
        isOpen={openFormModal}
        onClose={closeAndGoBack}
        title={taskId ? "Update Task" : "Create Task"}
        variant="wide"
        footer={
          <div className="flex justify-end">
            <button
              className="add-btn w-auto px-6"
              onClick={handleSubmit}
              disabled={loading}
            >
              {taskId ? "UPDATE TASK" : "CREATE TASK"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 mt-1">
          <div className="form-card">
            <div className="flex items-center justify-between">
              {taskId && (
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    currentTask?.status || "Pending"
                  )} px-3 py-1 rounded`}
                >
                  {currentTask?.status || "Pending"}
                </div>
              )}
              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>

              <input
                placeholder="Create App UI"
                className="form-input"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Classification
                </label>

                <SelectDropdown
                  options={CLASSIFICATION_DATA}
                  value={taskData.classification}
                  onChange={(value) =>
                    handleValueChange("classification", value)
                  }
                  placeholder="Select Classification"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>

                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Previsto
                </label>

                <input
                  placeholder="Create App UI"
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                  type="date"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>

                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) => {
                    handleValueChange("assignedTo", value);
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">TODO Checklist</label>
              </div>

              {taskId ? (
                !checklistEditMode ? (
                  <div className="mt-1">
                    {Array.isArray(currentTask?.todoChecklist) && currentTask.todoChecklist.map((item, index) => (
                      <div key={`todo_view_${index}`} className="flex items-center gap-3 mt-2">
                        <input
                          readOnly
                          onClick={() => enterEditAtIndex(index)}
                          value={item.text}
                          className="form-input flex-1 cursor-text"
                        />
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={() => toggleChecklistItem(index)}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
                        />
                      </div>
                    ))}
                    {(!currentTask?.todoChecklist || currentTask.todoChecklist.length === 0) && (
                      <p className="text-xs text-gray-500 mt-1">No checklist items.</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-1" ref={editChecklistRef}>
                    {(taskData?.todoChecklist || []).map((text, index) => (
                      <div key={`todo_edit_${index}`} className="flex items-center gap-2 mt-2">
                        <input
                          className="form-input flex-1 mt-0"
                          value={text}
                          onChange={(e) => handleEditItemChange(index, e.target.value)}
                          ref={(el) => (editInputsRef.current[index] = el)}
                        />
                        <button className="cursor-pointer mt-2" onClick={() => handleDeleteItem(index)} title="Remove">
                          <HiOutlineTrash className="text-lg text-red-500" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Enter Task"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        className="form-input flex-1 mt-0"
                      />
                      <button className="card-btn text-nowrap dark:!text-white mt-2" onClick={handleAddItem}>
                        <HiMiniPlus className="text-lg" /> Add
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="mt-1">
                  <TodoListInput
                    todoList={taskData?.todoChecklist}
                    setTodoList={(value) => handleValueChange("todoChecklist", value)}
                  />
                </div>
              )}

              {/* no quick-add in view mode after revert */}
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Add Attachments
              </label>

              <AddAttachmentsInput
                attachments={taskData?.attachments}
                setAttachments={(value) =>
                  handleValueChange("attachments", value)
                }
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;

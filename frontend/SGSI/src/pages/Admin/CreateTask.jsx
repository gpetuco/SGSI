import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA, CLASSIFICATION_DATA } from "../../utils/menus";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import { NIST_CSF_DATA } from "../../utils/nistCsfData";
import { ISO_27001_DATA } from "../../utils/iso27001Data";
import SelectUsers from "../../components/Inputs/SelectUsers";
import SelectCompany from "../../components/Inputs/SelectCompany";
import TodoListInput from "../../components/Inputs/TodoListInput";
import Excluir from "../../components/Excluir";
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

const getStatusLabel = (status) => {
  switch (status) {
    case "In Progress":
      return "Em Andamento";
    case "Completed":
      return "Concluído";
    case "Pending":
    default:
      return "Pendente";
  }
};

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();
  const [openFormModal, setOpenFormModal] = useState(true);

  const [taskData, setTaskData] = useState({
    title: "",
    descricao: "",
    classification: "NIST CSF",
    priority: "Low",
    dueDate: null,
    responsavel: [],
    cliente: "",
    itens: [],
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [checklistEditMode, setChecklistEditMode] = useState(false);
  const editChecklistRef = useRef(null);
  const editInputsRef = useRef([]);
  const [editFocusIndex, setEditFocusIndex] = useState(null);
  const [suppressOutsideOnce, setSuppressOutsideOnce] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // salvar (criar/atualizar)
  const [loadingTask, setLoadingTask] = useState(!!taskId); // carregar dados iniciais em modo edição

  const [openExcluir, setOpenExcluir] = useState(false);

  // Helpers for NIST CSF / ISO 27001 cascata
  const isCascadeFramework =
    taskData.classification === "NIST CSF" ||
    taskData.classification === "ISO 27001";

  const frameworkData =
    taskData.classification === "NIST CSF"
      ? NIST_CSF_DATA
      : taskData.classification === "ISO 27001"
      ? ISO_27001_DATA
      : null;

  const functionOptions = frameworkData
    ? frameworkData.functions.map((f) => ({
        label: f.name,
        value: f.name,
      }))
    : [];

  const selectedFunction =
    frameworkData && taskData.title
      ? frameworkData.functions.find((f) => f.name === taskData.title)
      : null;

  const categoryOptions = selectedFunction
    ? selectedFunction.categories.map((c) => ({ label: c.name, value: c.name }))
    : [];

  const selectedCategory =
    selectedFunction && taskData.descricao
      ? selectedFunction.categories.find((c) => c.name === taskData.descricao)
      : null;

  const subcategoryOptions = selectedCategory
    ? selectedCategory.subcategories.map((s) => ({
        label: s.name,
        value: s.name,
      }))
    : [];

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleClassificationChange = (value) => {
    // reset cascade when classification changes
    setTaskData((prev) => ({
      ...prev,
      classification: value,
      title: "",
      descricao: "",
      itens: [],
    }));
  };

  const handleNistTitleChange = (value) => {
    // when function changes, clear dependent fields
    setTaskData((prev) => ({
      ...prev,
      title: value,
      descricao: "",
      itens: [],
    }));
  };

  const handleNistDescricaoChange = (value) => {
    // when category changes, clear checklist selections
    setTaskData((prev) => ({
      ...prev,
      descricao: value,
      itens: [],
    }));
  };

  const clearData = () => {
    //reset form
    setTaskData({
      title: "",
      descricao: "",
      classification: "NIST CSF",
      priority: "Low",
      dueDate: null,
      responsavel: [],
      cliente: "",
      itens: [],
    });
  };

  // Create Task
  const createTask = async () => {
    setLoading(true);

    try {
      const todolist = taskData.itens?.map((item) => ({
        text: item,
        completed: false,
      }));

      const response = await axiosReq.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        itens: todolist,
      });

      toast.success("Ação criada com sucesso!");

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
      const todolist = taskData.itens?.map((item) => {
        const prevItens = currentTask?.itens || [];
        const matchedTask = prevItens.find((task) => task.text == item);

        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });

      const response = await axiosReq.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        itens: todolist,
      });

      toast.success("Ação salva com sucesso!");
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
      const next = Array.isArray(currentTask?.itens)
        ? [...currentTask.itens]
        : [];
      if (!next[index]) return;
      next[index] = { ...next[index], completed: !next[index].completed };

      const response = await axiosReq.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
        { itens: next }
      );
      if (response.status === 200) {
        const updated = response.data?.task;
        setCurrentTask(updated);
        setTaskData((prev) => ({
          ...prev,
          itens: Array.isArray(updated?.itens)
            ? updated.itens.map((i) => i.text)
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
      setError("Título é obrigatório.");
      return;
    }
    if (!taskData.descricao.trim()) {
      setError("Descrição é obrigatória.");
      return;
    }
    if (!taskData.cliente) {
      setError("Selecione um cliente.");
      return;
    }
    if (!taskData.dueDate) {
      setError("Data Prevista é obrigatório.");
      return;
    }

    if (taskData.responsavel?.length === 0) {
      setError("Ação não atribuída a nenhum responsável.");
      return;
    }

    if (taskData.itens?.length === 0) {
      setError("Adicione pelo menos um item.");
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
      setLoadingTask(true);
      const response = await axiosReq.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      );

      if (response.data) {
        const taskInfo = response.data;
        setCurrentTask(taskInfo);

        setTaskData((prevState) => ({
          title: taskInfo.title,
          descricao: taskInfo.descricao,
          classification: taskInfo.classification || "NIST CSF",
          priority: taskInfo.priority,
          dueDate: taskInfo.dueDate
            ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
            : null,
          responsavel: taskInfo?.responsavel?.map((item) => item?._id) || [],
          cliente:
            (taskInfo?.cliente && taskInfo?.cliente?._id) ||
            taskInfo?.cliente ||
            "",
          itens: taskInfo?.itens?.map((item) => item?.text) || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingTask(false);
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
      if (
        editChecklistRef.current &&
        !editChecklistRef.current.contains(e.target)
      ) {
        commitChecklistChanges();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          try {
            el.setSelectionRange(val.length, val.length);
            // eslint-disable-next-line no-empty
          } catch (_) {}
        }
      };
      setTimeout(focus, 0);
    }
  }, [checklistEditMode, editFocusIndex]);

  const commitChecklistChanges = async (nextTexts) => {
    if (!taskId) return;
    try {
      const old = Array.isArray(currentTask?.itens) ? currentTask.itens : [];
      const byText = new Map(old.map((o) => [o.text, !!o.completed]));
      const source = Array.isArray(nextTexts)
        ? nextTexts
        : taskData?.itens || [];
      const updated = source.map((txt, idx) => ({
        text: txt,
        completed: byText.has(txt) ? byText.get(txt) : !!old[idx]?.completed,
      }));
      const res = await axiosReq.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
        { itens: updated }
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
      const next = [...(prev.itens || [])];
      next[index] = value;
      return { ...prev, itens: next };
    });
  };

  const enterEditAtIndex = (index) => {
    setTaskData((prev) => ({
      ...prev,
      itens: Array.isArray(currentTask?.itens)
        ? currentTask.itens.map((i) => i.text)
        : prev.itens,
    }));
    setSuppressOutsideOnce(true);
    setEditFocusIndex(index);
    setChecklistEditMode(true);
  };

  const handleDeleteItem = (index) => {
    setTaskData((prev) => {
      const next = (prev.itens || []).filter((_, i) => i !== index);
      // Persist immediately in update mode to keep indices aligned
      commitChecklistChanges(next);
      return { ...prev, itens: next };
    });
  };

  const handleAddItem = () => {
    const v = (newTodoText || "").trim();
    if (!v) return;
    setTaskData((prev) => {
      const exists = (prev.itens || []).some((t) => t === v);
      const next = exists ? prev.itens : [...(prev.itens || []), v];
      // Persist immediately in update mode
      commitChecklistChanges(next);
      return { ...prev, itens: next };
    });
    setNewTodoText("");
  };

  // no-op helpers from previous revert

  // Delete Task
  const deleteTask = async () => {
    try {
      await axiosReq.delete(API_PATHS.TASKS.DELETE_TASK(taskId));

      setOpenExcluir(false);
      toast.success("Ação excluída com sucesso!");
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

  if (taskId && loadingTask && !currentTask) {
    return (
      <DashboardLayout activeMenu="Create Task">
        <Modal
          isOpen={openFormModal}
          onClose={closeAndGoBack}
          title={"A��o"}
          variant="wide"
        >
          <div className="grid grid-cols-1 mt-1">
            <div className="form-card">
              <h2 className="text-sm md:text-xl font-medium mb-2">
                Carregando dados da a��o...
              </h2>
              <p className="text-xs md:text-[13px] text-slate-500">
                Aguarde enquanto buscamos as informa����es da a��o selecionada.
              </p>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Create Task">
      <Modal
        isOpen={openFormModal}
        onClose={closeAndGoBack}
        title={"Ação"}
        variant="wide"
        footer={
          <div className="flex justify-end">
            <button
              className="add-btn w-auto px-6"
              onClick={handleSubmit}
              disabled={loading}
            >
              {"Salvar"}
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
                  {getStatusLabel(currentTask?.status || "Pending")}
                </div>
              )}
              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenExcluir(true)}
                >
                  <LuTrash2 className="text-base" /> Apagar
                </button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Classificação
                </label>

                <SelectDropdown
                  options={CLASSIFICATION_DATA}
                  value={taskData.classification}
                  onChange={(value) => handleClassificationChange(value)}
                  placeholder="Select Classification"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Prioridade
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
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Título
              </label>

              {isCascadeFramework ? (
                <div className="relative">
                  <SelectDropdown
                    options={functionOptions}
                    value={taskData.title}
                    onChange={(value) => handleNistTitleChange(value)}
                    placeholder="Selecione um item"
                  />
                </div>
              ) : (
                <input
                  placeholder="Create App UI"
                  className="form-input"
                  value={taskData.title}
                  onChange={({ target }) =>
                    handleValueChange("title", target.value)
                  }
                />
              )}
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Descrição
              </label>

              {isCascadeFramework ? (
                <div className="relative opacity-100">
                  <div
                    className={!taskData.title ? "opacity-50" : "opacity-100"}
                  >
                    <SelectDropdown
                      options={categoryOptions}
                      value={taskData.descricao}
                      onChange={(value) => handleNistDescricaoChange(value)}
                      placeholder={
                        taskData.title
                          ? "Selecione um item"
                          : "Selecione Título antes"
                      }
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder="Describe task"
                  className="form-input"
                  rows={4}
                  value={taskData.descricao}
                  onChange={({ target }) =>
                    handleValueChange("descricao", target.value)
                  }
                />
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">
                  Itens
                </label>
              </div>

              {taskId ? (
                <div className="mt-1" ref={editChecklistRef}>
                  {(taskData?.itens || []).map((text, index) => (
                    <div
                      key={`todo_row_${index}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 mt-2 pr-3"
                    >
                      <input
                        className="form-input flex-1 mt-0"
                        value={text}
                        readOnly={isCascadeFramework}
                        onChange={
                          isCascadeFramework
                            ? undefined
                            : (e) => handleEditItemChange(index, e.target.value)
                        }
                        onBlur={
                          isCascadeFramework
                            ? undefined
                            : (e) => {
                                const next = (taskData?.itens || []).map(
                                  (t, i) => (i === index ? e.target.value : t)
                                );
                                commitChecklistChanges(next);
                              }
                        }
                        ref={(el) => (editInputsRef.current[index] = el)}
                      />
                      <input
                        type="checkbox"
                        checked={!!currentTask?.itens?.[index]?.completed}
                        onChange={() => toggleChecklistItem(index)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
                      />
                      <button
                        className="cursor-pointer"
                        onClick={() => handleDeleteItem(index)}
                        title="Remove"
                      >
                        <HiOutlineTrash className="text-lg text-red-500" />
                      </button>
                    </div>
                  ))}

                  {/* Add row */}
                  {isCascadeFramework ? (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 mt-2 pr-3">
                      <div className="relative">
                        <div
                          className={
                            !taskData.title || !taskData.descricao
                              ? "opacity-50"
                              : "opacity-100"
                          }
                        >
                          <SelectDropdown
                            options={subcategoryOptions}
                            value={newTodoText}
                            onChange={(value) => setNewTodoText(value)}
                            placeholder={
                              taskData.descricao
                                ? "Selecione um item"
                                : taskData.title
                                ? "Selecione Descrição antes"
                                : "Selecione Título antes"
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="card-btn text-nowrap dark:!text-white"
                        onClick={handleAddItem}
                        disabled={!newTodoText}
                      >
                        <HiMiniPlus className="text-lg" /> Adicionar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 mt-2 pr-3">
                      <input
                        type="text"
                        placeholder="Enter Task"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        className="form-input flex-1 mt-0"
                      />
                      <button
                        className="card-btn text-nowrap dark:!text-white"
                        onClick={handleAddItem}
                      >
                        <HiMiniPlus className="text-lg" /> Adicionar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-1">
                  {isCascadeFramework ? (
                    <>
                      {(taskData?.itens || []).map((text, index) => (
                        <div
                          key={`todo_row_create_${index}`}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 mt-2 pr-3"
                        >
                          <input
                            className="form-input flex-1 mt-0"
                            value={text}
                            readOnly
                          />
                          <input
                            type="checkbox"
                            disabled
                            className="w-4 h-4 opacity-50"
                          />
                          <button
                            className="cursor-pointer"
                            onClick={() => handleDeleteItem(index)}
                            title="Remove"
                          >
                            <HiOutlineTrash className="text-lg text-red-500" />
                          </button>
                        </div>
                      ))}
                      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 mt-2 pr-3">
                        <div className="relative">
                          <div
                            className={
                              !taskData.title || !taskData.descricao
                                ? "opacity-50"
                                : "opacity-100"
                            }
                          >
                            <SelectDropdown
                              options={subcategoryOptions}
                              value={newTodoText}
                              onChange={(value) => setNewTodoText(value)}
                              placeholder={
                                taskData.descricao
                                  ? "Selecione um item"
                                  : taskData.title
                                  ? "Selecione Descrição antes"
                                  : "Selecione Título antes"
                              }
                            />
                          </div>
                        </div>
                        <button
                          className="card-btn text-nowrap dark:!text-white"
                          onClick={handleAddItem}
                          disabled={!newTodoText}
                        >
                          <HiMiniPlus className="text-lg" /> Adicionar
                        </button>
                      </div>
                    </>
                  ) : (
                    <TodoListInput
                      todoList={taskData?.itens}
                      setTodoList={(value) => handleValueChange("itens", value)}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Cliente
              </label>
              <SelectCompany
                value={taskData.cliente}
                onChange={(value) => handleValueChange("cliente", value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Responsável
              </label>

              <SelectUsers
                selectedUsers={taskData.responsavel}
                setSelectedUsers={(value) => {
                  handleValueChange("responsavel", value);
                }}
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openExcluir}
        onClose={() => setOpenExcluir(false)}
        title="Apagar ação"
      >
        <Excluir
          content="Você deseja apagar essa ação?"
          onDelete={() => deleteTask()}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;

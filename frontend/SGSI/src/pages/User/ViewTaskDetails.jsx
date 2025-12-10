import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosReq from "../../utils/axiosReq";
import { API_PATHS } from "../../utils/apiUrl";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import FotosUsuarios from "../../components/FotosUsuarios";
import moment from "moment";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [openModal, setOpenModal] = useState(true);

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

  // get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosReq.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));

      if (response.data) {
        const taskInfo = response.data;
        setTask(taskInfo);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // handle todo check
  const updateItens = async (index) => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const itens = [...task?.itens];
    const taskId = id;

    if (itens && itens[index]) {
      itens[index].completed = !itens[index].completed;

      try {
        const response = await axiosReq.put(
          API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
          { itens }
        );
        if (response.status === 200) {
          setTask(response.data?.task || task);
        } else {
          itens[index].completed = !itens[index].completed;
        }
      } catch (error) {
        itens[index].completed = !itens[index].completed;
      }
    }
  };

  useEffect(() => {
    if (id) {
      getTaskDetailsByID();
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const closeAndGoBack = () => {
    setOpenModal(false);
    setTimeout(() => window.history.back(), 0);
  };

  return (
    <DashboardLayout activeMenu="My Tasks">
      <Modal
        isOpen={openModal}
        onClose={closeAndGoBack}
        title={task?.title || "Task Details"}
        variant="wide"
      >
        {task && (
          <div className="grid grid-cols-1 mt-1">
            <div className="form-card">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">
                  {task?.title}
                </h2>
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    task?.status
                  )} px-4 py-0.5 rounded`}
                >
                  {task?.status}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox label="Descrição" value={task?.descricao} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Priority" value={task?.priority} />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Previsto"
                    value={
                      task?.dueDate
                        ? moment(task?.dueDate).format("Do MMM YYYY")
                        : "N/A"
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>
                  <FotosUsuarios
                    avatars={
                      task?.assignedTo?.map((item) => item?.profileImageUrl) ||
                      []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Itens
                </label>
                {task?.itens?.map((item, index) => (
                  <Itens
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item?.completed}
                    onChange={() => updateItens(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>

      <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
        {value}
      </p>
    </>
  );
};

const Itens = ({ text, isChecked, onChange }) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
      />

      <p className="text-[13px] text-gray-800">{text}</p>
    </div>
  );
};

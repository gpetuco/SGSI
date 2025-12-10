import React, { useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";

const ItensInput = ({ todoList, setTodoList }) => {
  const [option, setOption] = useState("");

  const handleAddOption = () => {
    if (option.trim()) {
      setTodoList([...todoList, option.trim()]);
      setOption("");
    }
  };

  const handleDeleteOption = (index) => {
    const updatedArr = todoList.filter((_, idx) => idx !== index);
    setTodoList(updatedArr);
  };
  return (
    <div>
      {todoList.map((item, index) => (
        <div
          key={item}
          className="flex justify-between bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-500 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <p className="text-xs text-black dark:text-white">
            <span className="text-xs text-gray-400 dark:text-slate-300 font-semibold mr-2">
              {index < 9 ? `0${index + 1}` : index + 1}
            </span>
            {item}
          </p>

          <button
            className="cursor-pointer"
            onClick={() => {
              handleDeleteOption(index);
            }}
          >
            <HiOutlineTrash className="text-lg text-red-500" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-5 mt-4">
        <input
          type="text"
          placeholder="Enter Acao"
          value={option}
          onChange={({ target }) => setOption(target.value)}
          className="w-full text-[13px] text-black dark:text-white outline-none bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-500 px-3 py-2 rounded-md"
        />

        <button
          className="content-box-btn text-nowrap dark:!text-white"
          onClick={handleAddOption}
        >
          <HiMiniPlus className="text-lg" /> Add
        </button>
      </div>
    </div>
  );
};

export default ItensInput;

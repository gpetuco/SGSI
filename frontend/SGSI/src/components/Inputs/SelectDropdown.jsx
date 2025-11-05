import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm text-black dark:text-slate-100 outline-none bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        {value
          ? options.find((opt) => opt.value === value)?.label
          : placeholder}
        <span className="ml-2">
          {isOpen ? (
            <LuChevronDown classNarotate-180me="" />
          ) : (
            <LuChevronDown />
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-full bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-500 rounded-md mt-1 shadow-md z-10">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-black dark:text-slate-100"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;


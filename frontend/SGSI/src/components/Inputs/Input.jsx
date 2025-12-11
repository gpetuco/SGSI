import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({
  value,
  onChange,
  hidden,
  labelClassName,
  inputClassName,
  label,
  placeholder,
  type,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const ocultarSenha = () => {
    setShowPassword(!showPassword);
  };
  const effectiveLabelClass = labelClassName || "text-[13px] text-slate-800";
  const effectiveInputClass =
    inputClassName || "w-full bg-transparent outline-none";

  return (
    <div hidden={hidden}>
      <label className={effectiveLabelClass}>{label}</label>

      <div className="input-campo">
        <input
          type={
            type == "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          className={effectiveInputClass}
          value={value}
          onChange={(e) => onChange(e)}
        />

        {type === "password" && (
          <>
            {showPassword ? (
              <FaRegEye
                size={22}
                className="text-primary cursor-pointer"
                onClick={() => ocultarSenha()}
              />
            ) : (
              <FaRegEyeSlash
                size={22}
                className="text-slate-400 cursor-pointer"
                onClick={() => ocultarSenha()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;

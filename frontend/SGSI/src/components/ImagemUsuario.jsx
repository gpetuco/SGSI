import React from "react";

const tamanho = (size) => {
  if (!size) return "w-8 h-8";
  if (typeof size === "number") return `w-[${size}px] h-[${size}px]`;
  return size;
};

const ImagemUsuario = ({ src, name = "", size, className = "" }) => {
  const ini = (name || "").trim().charAt(0).toUpperCase();
  const tam = tamanho(size);

  if (src) {
    return (
      <img
        alt={name || "user"}
        className={`${tam} rounded-full ${className}`}
        src={src}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "";
        }}
      />
    );
  }

  return (
    <div
      className={`${tam} flex text-white justify-center font-semibold rounded-full bg-blue-600 items-center ${className}`}
    >
      {ini || "?"}
    </div>
  );
};

export default ImagemUsuario;

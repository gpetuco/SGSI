import React from "react";

const sizeToClass = (size) => {
  if (!size) return "w-8 h-8";
  if (typeof size === "number") return `w-[${size}px] h-[${size}px]`;
  return size; // allow passing full class string like "w-6 h-6"
};

const UserAvatar = ({ src, name = "", size, className = "" }) => {
  const initial = (name || "").trim().charAt(0).toUpperCase();
  const sizeCls = sizeToClass(size);

  if (src) {
    return (
      <img
        src={src}
        alt={name || "user"}
        className={`${sizeCls} rounded-full ${className}`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = ""; // trigger fallback render on re-render
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeCls} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold ${className}`}
    >
      {initial || "?"}
    </div>
  );
};

export default UserAvatar;


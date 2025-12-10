import React from "react";

const FotosUsuarios = ({ fotosPerfilUsuario, mostra = 3 }) => {
  return (
    <div className="flex items-center">
      {fotosPerfilUsuario.slice(0, mostra).map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt={`Avatar ${index}`}
          className="w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0"
        />
      ))}
      {fotosPerfilUsuario.length > mostra && (
        <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3">
          +{fotosPerfilUsuario.length - mostra}
        </div>
      )}
    </div>
  );
};

export default FotosUsuarios;

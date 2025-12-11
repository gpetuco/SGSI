import React from "react";

const FotosUsuarios = ({ fotosPerfilUsuario, mostra = 3 }) => {
  return (
    <div className="items-center flex">
      {fotosPerfilUsuario.slice(0, mostra).map((imagemResponsavel, index) => (
        <img
          className="h-9 rounded-full border-2 first:ml-0 w-9 -ml-3 border-white"
          key={index}
          src={imagemResponsavel}
          alt={`Usuario ${index}`}
        />
      ))}
      {fotosPerfilUsuario.length > mostra && (
        <div className="rounded-full border-2 h-9 flex items-center justify-center text-sm bg-blue-50 font-medium border-white w-9 -ml-3">
          +{fotosPerfilUsuario.length - mostra}
        </div>
      )}
    </div>
  );
};

export default FotosUsuarios;

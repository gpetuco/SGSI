import React, { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

const ImagemInput = ({ image, setImage }) => {
  const assoc = useRef(null);
  const [preVisualizacao, setPreVisualizacao] = useState(null);

  const escolherArquivo = () => {
    assoc.current.click();
  };

  const apagarImagem = () => {
    setImage(null);
    setPreVisualizacao(null);
  };

  const alterarImagem = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);

      const preview = URL.createObjectURL(file);
      setPreVisualizacao(preview);
    }
  };
  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={assoc}
        onChange={alterarImagem}
        className="hidden"
      />

      {!image ? (
        <div className="rounded-full w-20 bg-blue-100/50 justify-center cursor-pointer h-20 flex items-center relative">
          <LuUser className="text-4xl text-primary" />

          <button
            className="absolute rounded-full cursor-pointer text-white flex items-center justify-center bg-primary w-8 h-8 -bottom-1 -right-1"
            type="button"
            onClick={escolherArquivo}
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preVisualizacao}
            alt="Foto"
            className="object-cover w-20 h-20 rounded-full "
          />
          <button
            className="absolute rounded-full bg-red-500 text-white flex items-center justify-center -bottom-1 -right-1 w-8 h-8"
            type="button"
            onClick={apagarImagem}
          >
            <LuTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImagemInput;

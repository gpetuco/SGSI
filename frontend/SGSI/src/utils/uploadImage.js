import { URLS_API } from "./apiUrl";
import axiosReq from "./axiosReq";

const uploadImage = async (imageFile) => {
  const dadosForm = new FormData();
  dadosForm.append("image", imageFile);

  try {
    const response = await axiosReq.post(
      URLS_API.IMAGE.UPLOAD_IMAGE,
      dadosForm,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
};

export default uploadImage;

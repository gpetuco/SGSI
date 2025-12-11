import { URL_SGSI } from "./apiUrl";
import axios from "axios";

const axiosReq = axios.create({
  baseURL: URL_SGSI,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosReq.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Erro.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Erro.");
    }
    return Promise.reject(error);
  }
);

axiosReq.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosReq;

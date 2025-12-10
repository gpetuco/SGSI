export const BASE_URL = "http://localhost:8000";

export const URLS_API = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },

  COMPANIES: {
    LIST: "/api/companies",
    CREATE: "/api/companies",
  },

  USERS: {
    GET_ALL_USERS: "/api/users",
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
    CREATE_USER: "/api/users",
    UPDATE_USER: (userId) => `/api/users/${userId}`,
    DELETE_USER: (userId) => `/api/users/${userId}`,
  },

  ACOES: {
    GET_DASHBOARD_DATA: "/api/acoes/dashboard-data",
    GET_USER_DASHBOARD_DATA: "/api/acoes/user-dashboard-data",
    GET_ALL_ACOES: "/api/acoes",
    GET_ACAO_BY_ID: (acaoId) => `/api/acoes/${acaoId}`,
    CREATE_ACAO: "/api/acoes",
    UPDATE_ACAO: (acaoId) => `/api/acoes/${acaoId}`,
    DELETE_ACAO: (acaoId) => `/api/acoes/${acaoId}`,

    UPDATE_ACAO_STATUS: (acaoId) => `/api/acoes/${acaoId}/status`,
    UPDATE_TODO_CHECKLIST: (acaoId) => `/api/acoes/${acaoId}/todo`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "api/auth/upload-image",
  },
};

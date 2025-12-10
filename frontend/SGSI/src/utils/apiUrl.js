export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
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
    GET_TASK_BY_ID: (acaoId) => `/api/acoes/${acaoId}`,
    CREATE_TASK: "/api/acoes",
    UPDATE_TASK: (acaoId) => `/api/acoes/${acaoId}`,
    DELETE_TASK: (acaoId) => `/api/acoes/${acaoId}`,

    UPDATE_TASK_STATUS: (acaoId) => `/api/acoes/${acaoId}/status`,
    UPDATE_TODO_CHECKLIST: (acaoId) => `/api/acoes/${acaoId}/todo`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "api/auth/upload-image",
  },
};

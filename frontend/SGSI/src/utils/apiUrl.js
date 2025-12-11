export const URL_SGSI = "http://localhost:8000";

export const URLS_API = {
  USUARIOS: {
    GET_ALL_USUARIOS: "/api/users",
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
    CREATE_USER: "/api/users",
    UPDATE_USER: (userId) => `/api/users/${userId}`,
    DELETE_USER: (userId) => `/api/users/${userId}`,
  },

  ACOES: {
    DADOS_DASHBOARD: "/api/acoes/dashboard-data",
    DADOS_DASHBOARD_CLIENTE: "/api/acoes/user-dashboard-data",
    DADOS_ACOES: "/api/acoes",
    ACAO_DETALHE: (acaoId) => `/api/acoes/${acaoId}`,
    CRIAR_ACAO: "/api/acoes",
    EDITAR_ACAO: (acaoId) => `/api/acoes/${acaoId}`,
    APAGAR_ACAO: (acaoId) => `/api/acoes/${acaoId}`,

    EDITAR_ACAO_STATUS: (acaoId) => `/api/acoes/${acaoId}/status`,
    ATUALIZAR_ITENS_FEITOS: (acaoId) => `/api/acoes/${acaoId}/todo`,
  },

  AUTH: {
    CADASTRO: "/api/auth/register",
    LOGIN: "/api/auth/login",
    DADOS_PERFIL: "/api/auth/profile",
  },

  CLIENTES: {
    DADOS_CLIENTES: "/api/companies",
    CREATE: "/api/companies",
  },

  FOTO_PERFIL: {
    ABRIR_ARQUIVO: "api/auth/upload-image",
  },
};

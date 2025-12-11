import {
  LuLayoutDashboard,
  LuUsers,
  LuLogOut,
  LuListTodo,
  LuBadgeCheck,
  LuNetwork,
  LuColumns3,
  LuBuilding2,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Ações",
    icon: LuListTodo,
    path: "/admin/acoes",
  },
  {
    id: "02f",
    label: "NIST CSF",
    icon: LuNetwork,
    path: "/admin/acoes/nist-csf",
  },
  {
    id: "02e",
    label: "ISO 27001",
    icon: LuBadgeCheck,
    path: "/admin/acoes/iso-27001",
  },
  {
    id: "02c",
    label: "Kanban",
    icon: LuColumns3,
    path: "/admin/kanban",
  },
  {
    id: "04",
    label: "Membros",
    icon: LuUsers,
    path: "/admin/users",
  },
  {
    id: "04b",
    label: "Clientes",
    icon: LuBuilding2,
    path: "/admin/clientes",
  },
  {
    id: "05",
    label: "Sair",
    icon: LuLogOut,
    path: "logout",
  },
];

export const SIDE_MENU_USER_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/user/dashboard",
  },
  {
    id: "02",
    label: "Ações",
    icon: LuListTodo,
    path: "/user/acoes",
  },
  {
    id: "02f",
    label: "NIST CSF",
    icon: LuNetwork,
    path: "/user/acoes/nist-csf",
  },
  {
    id: "02e",
    label: "ISO 27001",
    icon: LuBadgeCheck,
    path: "/user/acoes/iso-27001",
  },
  {
    id: "02c",
    label: "Kanban",
    icon: LuColumns3,
    path: "/user/kanban",
  },
  {
    id: "05",
    label: "Sair",
    icon: LuLogOut,
    path: "logout",
  },
];

export const STATUS_DATA = [
  { label: "Pendente", value: "Pendente" },
  { label: "Em Andamento", value: "Em Andamento" },
  { label: "Concluído", value: "Concluído" },
];

export const PRIORIDADE_DATA = [
  { label: "Baixa", value: "Baixa" },
  { label: "Média", value: "Media" },
  { label: "Alta", value: "Alta" },
];

export const CLASSIFICATION_DATA = [
  { label: "NIST CSF", value: "NIST CSF" },
  { label: "ISO 27001", value: "ISO 27001" },
];

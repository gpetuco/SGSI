import {
  LuLayoutDashboard,
  LuUsers,
  LuClipboardCheck,
  LuSquarePlus,
  LuLogOut,
  LuListTodo,
  LuShieldCheck,
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
    path: "/admin/tasks",
  },
  {
    id: "02f",
    label: "NIST CSF",
    icon: LuNetwork,
    path: "/admin/tasks/nist-csf",
  },
  {
    id: "02e",
    label: "ISO 27001",
    icon: LuBadgeCheck,
    path: "/admin/tasks/iso-27001",
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
    path: "/user/tasks",
  },
  {
    id: "02f",
    label: "NIST CSF",
    icon: LuNetwork,
    path: "/user/tasks/nist-csf",
  },
  {
    id: "02e",
    label: "ISO 27001",
    icon: LuBadgeCheck,
    path: "/user/tasks/iso-27001",
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

export const PRIORIDADE_DATA = [
  { label: "Baixa", value: "Low" },
  { label: "Média", value: "Medium" },
  { label: "Alta", value: "High" },
];

export const STATUS_DATA = [
  { label: "Pendente", value: "Pendente" },
  { label: "Em Andamento", value: "Em Andamento" },
  { label: "Concluído", value: "Concluído" },
];

export const CLASSIFICATION_DATA = [
  { label: "NIST CSF", value: "NIST CSF" },
  { label: "ISO 27001", value: "ISO 27001" },
];

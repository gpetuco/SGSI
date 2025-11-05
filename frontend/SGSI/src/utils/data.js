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
    id: "02d",
    label: "GRC",
    icon: LuShieldCheck,
    path: "/admin/tasks/grc",
  },
  {
    id: "02e",
    label: "ISO 27001",
    icon: LuBadgeCheck,
    path: "/admin/tasks/iso-27001",
  },
  {
    id: "02f",
    label: "NIST CSF",
    icon: LuNetwork,
    path: "/admin/tasks/nist-csf",
  },
  {
    id: "02c",
    label: "Kanban",
    icon: LuColumns3,
    path: "/admin/kanban",
  },
  {
    id: "02b",
    label: "My Tasks",
    icon: LuClipboardCheck,
    path: "/admin/my-tasks",
  },
  {
    id: "03",
    label: "Create Task",
    icon: LuSquarePlus,
    path: "/admin/create-task",
  },
  {
    id: "04",
    label: "Membros",
    icon: LuUsers,
    path: "/admin/users",
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
    label: "My Tasks",
    icon: LuClipboardCheck,
    path: "/user/tasks",
  },
  {
    id: "02c",
    label: "Kanban",
    icon: LuColumns3,
    path: "/user/kanban",
  },
  {
    id: "05",
    label: "Logout",
    icon: LuLogOut,
    path: "logout",
  },
];

export const PRIORITY_DATA = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

export const STATUS_DATA = [
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

export const CLASSIFICATION_DATA = [
  { label: "GRC", value: "GRC" },
  { label: "ISO 27001", value: "ISO 27001" },
  { label: "NIST CSF", value: "NIST CSF" },
];

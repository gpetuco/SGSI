import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Acoes from "./pages/Admin/Acoes";
import AdminAcaoDetalhar from "./pages/Admin/AcaoDetalhar";
import AdminKanban from "./pages/Admin/Kanban";
import Iso27001Tasks from "./pages/Admin/Iso27001Tasks";
import NistCsfTasks from "./pages/Admin/NistCsfTasks";
import CriarAcao from "./pages/Admin/CriarAcao";
import Membros from "./pages/Admin/Membros";
import Clientes from "./pages/Admin/Clientes";

import AdminOnlyAcess from "./routes/AdminOnlyAcess";
import UserProvider, { UserContext } from "./context/userContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />

            {/* Admin Routes */}
            <Route element={<AdminOnlyAcess allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/tasks" element={<Acoes />} />
              <Route path="/admin/kanban" element={<AdminKanban />} />
              <Route
                path="/admin/tasks/iso-27001"
                element={<Iso27001Tasks />}
              />
              <Route path="/admin/tasks/nist-csf" element={<NistCsfTasks />} />
              <Route path="/admin/acao-modal" element={<CriarAcao />} />
              <Route path="/admin/users" element={<Membros />} />
              <Route path="/admin/clientes" element={<Clientes />} />
              <Route
                path="/admin/task-details/:id"
                element={<AdminAcaoDetalhar />}
              />
            </Route>

            <Route element={<AdminOnlyAcess allowedRoles={["member"]} />}>
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/tasks" element={<Acoes />} />
              <Route path="/user/kanban" element={<AdminKanban />} />
              <Route path="/user/tasks/iso-27001" element={<Iso27001Tasks />} />
              <Route path="/user/tasks/nist-csf" element={<NistCsfTasks />} />
              <Route
                path="/user/task-details/:id"
                element={<AdminAcaoDetalhar />}
              />
            </Route>

            <Route path="/" element={<Root />} />
          </Routes>
        </Router>
      </div>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Outlet />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin" ? (
    <Navigate to="/admin/dashboard" />
  ) : (
    <Navigate to="/user/dashboard" />
  );
};

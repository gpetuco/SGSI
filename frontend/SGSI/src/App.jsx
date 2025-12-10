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
import Iso27001Acoes from "./pages/Admin/Iso27001Acoes";
import NistCsfAcoes from "./pages/Admin/NistCsfAcoes";
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
              <Route path="/admin/acoes" element={<Acoes />} />
              <Route path="/admin/kanban" element={<AdminKanban />} />
              <Route
                path="/admin/acoes/iso-27001"
                element={<Iso27001Acoes />}
              />
              <Route path="/admin/acoes/nist-csf" element={<NistCsfAcoes />} />
              <Route path="/admin/acao-popup" element={<CriarAcao />} />
              <Route path="/admin/users" element={<Membros />} />
              <Route path="/admin/clientes" element={<Clientes />} />
              <Route
                path="/admin/acao-details/:id"
                element={<AdminAcaoDetalhar />}
              />
            </Route>

            <Route element={<AdminOnlyAcess allowedRoles={["member"]} />}>
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/acoes" element={<Acoes />} />
              <Route path="/user/kanban" element={<AdminKanban />} />
              <Route path="/user/acoes/iso-27001" element={<Iso27001Acoes />} />
              <Route path="/user/acoes/nist-csf" element={<NistCsfAcoes />} />
              <Route
                path="/user/acao-details/:id"
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

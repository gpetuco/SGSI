import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import React, { useContext } from "react";
import AdminAcaoDetalhar from "./pages/Admin/AcaoDetalhar";
import UsuarioPermissaoRole, {
  UserContext,
} from "./context/sessaoUsuarioContext";
import Iso27001Acoes from "./pages/Admin/Iso27001Acoes";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Admin/Dashboard";
import AdminOnlyAcess from "./routes/AdminOnlyAcess";
import CriarAcao from "./pages/Admin/CriarAcao";
import Acoes from "./pages/Admin/Acoes";
import AdminKanban from "./pages/Admin/Kanban";
import Clientes from "./pages/Admin/Clientes";
import Membros from "./pages/Admin/Membros";
import NistCsfAcoes from "./pages/Admin/NistCsfAcoes";
import { Toaster } from "react-hot-toast";
import SignUp from "./pages/Auth/SignUp";

const App = () => {
  return (
    <UsuarioPermissaoRole>
      <div>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />

            <Route element={<AdminOnlyAcess allowedRoles={["admin"]} />}>
              <Route path="/admin/acao-popup" element={<CriarAcao />} />
              <Route path="/admin/acoes" element={<Acoes />} />
              <Route path="/admin/clientes" element={<Clientes />} />
              <Route path="/admin/kanban" element={<AdminKanban />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<Membros />} />
              <Route
                path="/admin/acao-details/:id"
                element={<AdminAcaoDetalhar />}
              />
              <Route path="/admin/acoes/nist-csf" element={<NistCsfAcoes />} />
              <Route
                path="/admin/acoes/iso-27001"
                element={<Iso27001Acoes />}
              />
            </Route>

            <Route element={<AdminOnlyAcess allowedRoles={["member"]} />}>
              <Route path="/user/acoes" element={<Acoes />} />
              <Route path="/user/acoes/nist-csf" element={<NistCsfAcoes />} />
              <Route
                path="/user/acao-details/:id"
                element={<AdminAcaoDetalhar />}
              />
              <Route path="/user/kanban" element={<AdminKanban />} />
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/acoes/iso-27001" element={<Iso27001Acoes />} />
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
    </UsuarioPermissaoRole>
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

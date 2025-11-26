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
import ManageTasks from "./pages/Admin/ManageTasks";
import AdminMyTasks from "./pages/Admin/MyTasks";
import AdminViewTaskDetails from "./pages/Admin/ViewTaskDetails";
import AdminKanban from "./pages/Admin/Kanban";
import Iso27001Tasks from "./pages/Admin/Iso27001Tasks";
import NistCsfTasks from "./pages/Admin/NistCsfTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";
import Clients from "./pages/Admin/Clients";

import PrivateRoute from "./routes/PrivateRoute";
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
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/tasks" element={<ManageTasks />} />
              <Route path="/admin/kanban" element={<AdminKanban />} />
              <Route
                path="/admin/tasks/iso-27001"
                element={<Iso27001Tasks />}
              />
              <Route path="/admin/tasks/nist-csf" element={<NistCsfTasks />} />
              <Route path="/admin/create-task" element={<CreateTask />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/clients" element={<Clients />} />
              <Route path="/admin/my-tasks" element={<AdminMyTasks />} />
              <Route
                path="/admin/task-details/:id"
                element={<AdminViewTaskDetails />}
              />
            </Route>

            {/* User Routes (members: same pages as admin, read-only) */}
            <Route element={<PrivateRoute allowedRoles={["member"]} />}>
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/tasks" element={<ManageTasks />} />
              <Route path="/user/kanban" element={<AdminKanban />} />
              <Route
                path="/user/tasks/iso-27001"
                element={<Iso27001Tasks />}
              />
              <Route
                path="/user/tasks/nist-csf"
                element={<NistCsfTasks />}
              />
              <Route path="/user/my-tasks" element={<AdminMyTasks />} />
              <Route
                path="/user/task-details/:id"
                element={<AdminViewTaskDetails />}
              />
            </Route>

            {/* Default Route */}
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

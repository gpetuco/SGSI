import React from "react";
import { Outlet } from "react-router-dom";

const AdminOnlyAcess = ({ allowedRoles }) => {
  return <Outlet />;
};

export default AdminOnlyAcess;

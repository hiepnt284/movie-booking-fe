import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Nếu không có quyền, chuyển hướng tới trang không có quyền truy cập
    return <Unauthorized />;
  }

  // Nếu đã đăng nhập và có quyền, cho phép truy cập vào route
  return children;
};

export default ProtectedRoute;

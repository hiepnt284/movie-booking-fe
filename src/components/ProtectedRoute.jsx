import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";

const ProtectedRoute = ({ requiredRole = [], children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    // Nếu vai trò của user không nằm trong danh sách requiredRole, hiển thị trang Unauthorized
    return <Unauthorized />;
  }

  // Nếu đã đăng nhập và có quyền, cho phép truy cập vào route
  return children;
};

export default ProtectedRoute;

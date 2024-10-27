import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";
import { openModal } from "../store/slices/modalSlice";
import { MODAL_TYPES } from "../store/modalTypes";

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch()

  if (!user) {
    dispatch(openModal({ modalType: MODAL_TYPES.LOGIN }));
    // Nếu chưa đăng nhập, chuyển hướng tới trang đăng nhập
    
  }

  if (requiredRole && user.role !== requiredRole) {
    // Nếu không có quyền, chuyển hướng tới trang không có quyền truy cập
    return <Unauthorized/>;
  }

  // Nếu đã đăng nhập và có quyền, cho phép truy cập vào route
  return children;
};

export default ProtectedRoute;

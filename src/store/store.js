import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modalSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    auth: authReducer,
  },
});

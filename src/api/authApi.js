import { axiosClient } from "./axiosClient";

const authApi = {};

authApi.loginUser = (data) => {
  return axiosClient.post("/auth/login", data);
};

authApi.loginWithGoogle = (params = {}) => {
  return axiosClient.get("/auth/oauth/google", { params });
};

authApi.logoutUser = (data) => {
  return axiosClient.post("/auth/logout-once", data, {
    withCredentials: true,
  });
};

authApi.refreshToken = async (data) => {
  return axiosClient.post("/auth/refresh-token", data, {
    withCredentials: true,
  });
};

authApi.registerUser = (data) => {
  return axiosClient.post("/auth/register", data);
};

authApi.verifyOtp = (data) => {
  return axiosClient.post("/auth/verify-otp", data);
};

authApi.verifyLink = (data) => {
  return axiosClient.post("/auth/verify-link", data);
};

authApi.regenerateOtp = (data) => {
  return axiosClient.post("/auth/regenerate-otp", data);
};

authApi.forgotPassword = (data) => {
  return axiosClient.post("/auth/forgot-password", data);
};

authApi.recoverPassword = (data) => {
  return axiosClient.post("/auth/recover-password", data);
};

export default authApi;

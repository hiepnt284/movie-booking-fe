import axiosAuth from "./axiosAuth";

const userApi = {};

userApi.getInfo = () => {
  return axiosAuth.get(`/user/info`);
};

userApi.changePassword = (data) => {
  return axiosAuth.put(`/user/change-password`, data);
};
userApi.getBookingHistory = () => {
  return axiosAuth.get(`/user/booking-history`);
};

export default userApi;

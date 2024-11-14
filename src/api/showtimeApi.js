import axiosAuth from "./axiosAuth";
import { axiosClient } from "./axiosClient";

const showtimeApi = {};

// Lấy danh sách suất chiếu
showtimeApi.getAll = (params) => {
  return axiosAuth.get("/showtime", { params });
};

showtimeApi.getShowtimesForUser = (params) => {
  return axiosClient.get("/showtime/get", { params });
};

showtimeApi.getAvailableDates = (params) => {
  return axiosClient.get("/showtime/available-dates", { params });
};

// Tạo mới suất chiếu
showtimeApi.create = (showTimeData) => {
  return axiosAuth.post("/showtime", showTimeData);
};

// Lấy thông tin chi tiết của một suất chiếu theo ID
showtimeApi.getById = (id) => {
  return axiosAuth.get(`/showtime/${id}`);
};

// Cập nhật suất chiếu theo ID
showtimeApi.update = (id, updatedData) => {
  return axiosAuth.put(`/showtime/${id}`, updatedData);
};

// Xóa suất chiếu theo ID
showtimeApi.delete = (id) => {
  return axiosAuth.delete(`/showtime/${id}`);
};

showtimeApi.getSelectShowtime = (showTimeId) => {
  return axiosAuth.get(`/showtime/select/${showTimeId}`);
};

export default showtimeApi;

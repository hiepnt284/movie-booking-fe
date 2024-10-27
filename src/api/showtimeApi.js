import { axiosClient } from "./axiosClient";

const showtimeApi = {};

// Lấy danh sách suất chiếu
showtimeApi.getAll = (params) => {
  return axiosClient.get("/showtime", { params });
};

showtimeApi.getShowtimesForUser = (params) => {
  return axiosClient.get("/showtime/get", { params });
};

showtimeApi.getAvailableDates = (params) => {
  return axiosClient.get("/showtime/available-dates", { params });
};

// Tạo mới suất chiếu
showtimeApi.create = (showTimeData) => {
  return axiosClient.post("/showtime", showTimeData);
};

// Lấy thông tin chi tiết của một suất chiếu theo ID
showtimeApi.getById = (id) => {
  return axiosClient.get(`/showtime/${id}`);
};

// Cập nhật suất chiếu theo ID
showtimeApi.update = (id, updatedData) => {
  return axiosClient.put(`/showtime/${id}`, updatedData);
};

// Xóa suất chiếu theo ID
showtimeApi.delete = (id) => {
  return axiosClient.delete(`/showtime/${id}`);
};

showtimeApi.getSelectShowtime = (showTimeId) => {
  return axiosClient.get(`/showtime/select/${showTimeId}`);
};

export default showtimeApi;

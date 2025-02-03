import axiosAuth from "./axiosAuth";

const roomTypeApi = {};


roomTypeApi.getAll = () => {
  return axiosAuth.get("/roomtype/get");
};

roomTypeApi.update = (id, data) => {
  return axiosAuth.put(`/roomtype/${id}`, data);
};

export default roomTypeApi;

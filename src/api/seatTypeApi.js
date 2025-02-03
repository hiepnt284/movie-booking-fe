import axiosAuth from "./axiosAuth";

const seatTypeApi = {};

seatTypeApi.getAll = () => {
  return axiosAuth.get("/seatype/get");
};

seatTypeApi.update = (id, data) => {
  return axiosAuth.put(`/seatype/${id}`, data);
};

export default seatTypeApi;

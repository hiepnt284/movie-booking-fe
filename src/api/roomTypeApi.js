import axiosAuth from "./axiosAuth";

const roomTypeApi = {};


roomTypeApi.getAll = () => {
  return axiosAuth.get("/roomtype/get");
};

export default roomTypeApi;

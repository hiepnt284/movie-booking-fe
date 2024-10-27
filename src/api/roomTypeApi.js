import { axiosClient } from "./axiosClient";

const roomTypeApi = {};


roomTypeApi.getAll = () => {
  return axiosClient.get("/roomtype/get");
};

export default roomTypeApi;

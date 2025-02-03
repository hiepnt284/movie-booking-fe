import axiosAuth from "./axiosAuth";
const dayPriceApi = {};

dayPriceApi.getAll = () => {
  return axiosAuth.get("/dayprice");
};

dayPriceApi.update = (id, data) => {
  return axiosAuth.put(`/dayprice/${id}`, data);
};

export default dayPriceApi;

import axiosAuth from "./axiosAuth";
const staffApi = {};

staffApi.create = (staffData) => {
  return axiosAuth.post("/staff", staffData);
};

staffApi.getAll = (params) => {
  return axiosAuth.get("/staff", { params });
};
staffApi.get = (staffId) => {
  return axiosAuth.get(`/staff/${staffId}`);
};

staffApi.update = (staffId, staffData) => {
  return axiosAuth.put(`/staff/${staffId}`, staffData);
};

staffApi.changStatus = (staffId) => {
  return axiosAuth.patch(`/staff/${staffId}`);
};
export default staffApi;

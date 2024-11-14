import axiosAuth from "./axiosAuth"

const bookingApi = {};
bookingApi.get = (bookingId) => {
  return axiosAuth.get(`/booking/${bookingId}`);
};


bookingApi.verify = (data) => {
  return axiosAuth.post(`booking/verify?bookingCode=${data}`);
};
export default bookingApi;
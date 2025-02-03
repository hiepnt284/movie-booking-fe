import axiosAuth from "./axiosAuth"

const bookingApi = {};
bookingApi.get = (bookingId) => {
  return axiosAuth.get(`/booking/${bookingId}`);
};


bookingApi.verify = (data) => {
  return axiosAuth.post(`booking/verify?bookingCode=${data}`);
};

bookingApi.bookOff = (showTimeData) => {
  return axiosAuth.post("/booking/book-off", showTimeData);
};
export default bookingApi;
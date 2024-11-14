import axiosAuth from "./axiosAuth";
const paymentApi = {};

paymentApi.createVnPayPayment = (showTimeData) => {
  return axiosAuth.post("/payment/vn-pay", showTimeData);
};
export default paymentApi;
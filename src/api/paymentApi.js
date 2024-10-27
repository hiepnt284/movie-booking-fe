import { axiosClient } from "./axiosClient";

const paymentApi = {};

paymentApi.createVnPayPayment = (showTimeData) => {
  return axiosClient.post("/payment/vn-pay", showTimeData);
};
export default paymentApi;
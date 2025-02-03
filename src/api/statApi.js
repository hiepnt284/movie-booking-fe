import axiosAuth from "./axiosAuth";

const statApi = {};

// Lấy thống kê theo ngày
statApi.getDailyRevenue = ({ month, year, theaterId }) => {
  const params = { month, year };
  if (theaterId) {
    params.theaterId = theaterId;
  }
  return axiosAuth.get("/stat/daily", { params });
};

// Lấy thống kê theo tháng
statApi.getMonthlyRevenue = ({ year, theaterId }) => {
  const params = { year };
  if (theaterId) {
    params.theaterId = theaterId;
  }
  return axiosAuth.get("/stat/monthly", { params });
};

// Lấy thống kê theo năm
statApi.getYearlyRevenue = ({ theaterId }) => {
  const params = {};
  if (theaterId) {
    params.theaterId = theaterId;
  }
  return axiosAuth.get("/stat/yearly", { params });
};

statApi.getMovieStat = ({ theaterId }) => {
  const params = {};
  if (theaterId) {
    params.theaterId = theaterId;
  }
  return axiosAuth.get("/stat/movie", { params });
};

export default statApi;

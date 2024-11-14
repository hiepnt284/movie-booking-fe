import axiosAuth from "./axiosAuth";
const roomApi = {};

roomApi.create = (roomData) => {
  return axiosAuth.post("/room", roomData);
};

roomApi.getAll = (theaterId) => {
  return axiosAuth.get("/room", {
    params: { theaterId: theaterId },
  });
};
roomApi.get = (roomId) => {
  return axiosAuth.get(`/room/${roomId}`);
}

roomApi.update = (roomId, roomData) => {
  return axiosAuth.put(`/room/${roomId}`, roomData);
};

roomApi.delete = (roomId) => {
  return axiosAuth.delete(`/room/${roomId}`);
};
export default roomApi;

import { axiosClient } from "./axiosClient";

const roomApi = {};

roomApi.create = (roomData) => {
  return axiosClient.post("/room", roomData);
};

roomApi.getAll = (theaterId) => {
  return axiosClient.get("/room", {
    params: { theaterId: theaterId },
  });
};
roomApi.get = (roomId) => {
  return axiosClient.get(`/room/${roomId}`);
}

roomApi.update = (roomId, roomData) => {
  return axiosClient.put(`/room/${roomId}`, roomData);
};

roomApi.delete = (roomId) => {
  return axiosClient.delete(`/room/${roomId}`);
};
export default roomApi;

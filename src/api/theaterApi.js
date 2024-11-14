import axiosAuth from "./axiosAuth";
import { axiosClient } from "./axiosClient";
import FormData from "form-data";

const theaterApi = {};

theaterApi.getAll = (params) => {
  return axiosAuth.get("/theater", { params });
};

theaterApi.getAllForUser = () => {
  return axiosClient.get("/theater/get");
};

theaterApi.get = (id) => {
  return axiosClient.get(`/theater/${id}`);
};

theaterApi.create = (theaterData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "theater",
    new Blob([JSON.stringify(theaterData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("img", imgFile);
  }

  return axiosAuth.post("/theater", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

theaterApi.update = (theaterId, theaterData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "theater",
    new Blob([JSON.stringify(theaterData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("img", imgFile);
  }

  return axiosAuth.put(`/theater/${theaterId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a Theater
theaterApi.delete = (theaterId) => {
  return axiosAuth.delete(`/theater/${theaterId}`);
};

export default theaterApi;

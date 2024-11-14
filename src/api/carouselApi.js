import axiosAuth from "./axiosAuth";
import { axiosClient } from "./axiosClient";
import FormData from "form-data";
const carouselApi = {};

carouselApi.getAll = (params) => {
  return axiosAuth.get("/carousel", { params });
};

carouselApi.getAllForUser = () => {
  return axiosClient.get("/carousel/get");
};

carouselApi.get = (id) => {
  return axiosAuth.get(`/carousel/${id}`);
};

carouselApi.create = (carouselData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "carousel",
    new Blob([JSON.stringify(carouselData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("img", imgFile);
  }

  return axiosAuth.post("/carousel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

carouselApi.update = (carouselId, carouselData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "carousel",
    new Blob([JSON.stringify(carouselData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("img", imgFile);
  }

  return axiosAuth.put(`/carousel/${carouselId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a Theater
carouselApi.delete = (carouselId) => {
  return axiosAuth.delete(`/carousel/${carouselId}`);
};

export default carouselApi;

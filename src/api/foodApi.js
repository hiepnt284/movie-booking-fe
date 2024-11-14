import axiosAuth from "./axiosAuth";
import FormData from "form-data";
const foodApi = {};

foodApi.getAll = (params) => {
  return axiosAuth.get("/food", { params });
};

foodApi.getAllForUser = () => {
  return axiosAuth.get("/food/get");
};

foodApi.get = (id) => {
  return axiosAuth.get(`/food/${id}`);
};

foodApi.create = (foodData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "food",
    new Blob([JSON.stringify(foodData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("img", imgFile);
  }

  return axiosAuth.post("/food", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

foodApi.update = (foodId, foodData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "food",
    new Blob([JSON.stringify(foodData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("img", imgFile);
  }

  return axiosAuth.put(`/food/${foodId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a Theater
foodApi.delete = (foodId) => {
  return axiosAuth.delete(`/food/${foodId}`);
};

export default foodApi;

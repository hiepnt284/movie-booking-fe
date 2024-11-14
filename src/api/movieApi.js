import { axiosClient } from "./axiosClient";
import FormData from "form-data";
import axiosAuth from "./axiosAuth"

const movieApi = {};

movieApi.getAll = (params) => {
  return axiosAuth.get("/movie", { params });
};

movieApi.getAllActive = () => {
  return axiosClient.get("/movie/active");
};

movieApi.getNowShowing = () => {
  return axiosClient.get("/movie/now-showing");
}

movieApi.getComingSoon = () => {
  return axiosClient.get("/movie/coming-soon");
};

movieApi.get = (movieId) => {
  return axiosClient.get(`/movie/${movieId}`);
};

movieApi.create = (movieData, posterFile) => {
  const formData = new FormData();
  formData.append(
    "movie",
    new Blob([JSON.stringify(movieData)], { type: "application/json" })
  );
  if (posterFile) {
    formData.append("poster", posterFile);
  }

  return axiosAuth.post("/movie", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

movieApi.update = (movieId, movieData, posterFile) => {
  const formData = new FormData();
  formData.append(
    "movie",
    new Blob([JSON.stringify(movieData)], { type: "application/json" })
  );
  if (posterFile) {
    formData.append("poster", posterFile);
  }

  return axiosAuth.put(`/movie/${movieId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a movie
movieApi.delete = (movieId) => {
  return axiosAuth.delete(`/movie/${movieId}`);
};

export default movieApi;

import { axiosClient } from "./axiosClient";
import FormData from "form-data";

const movieApi = {};

movieApi.getAll = (params) => {
  return axiosClient.get("/movie", { params });
};

movieApi.getAllActive = () => {
  return axiosClient.get("/movie/get")
}

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

  return axiosClient.post("/movie", formData, {
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

  return axiosClient.put(`/movie/${movieId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a movie
movieApi.delete = (movieId) => {
  return axiosClient.delete(`/movie/${movieId}`);
};

export default movieApi;

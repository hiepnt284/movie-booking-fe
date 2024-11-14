import axiosAuth from "./axiosAuth";
import FormData from "form-data";
import { axiosClient } from "./axiosClient";

const postApi = {};

postApi.uploadImage = (imgFile) => {
  const formData = new FormData();
    formData.append("image", imgFile);

  return axiosAuth.post("/post/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

postApi.getAll = (params) => {
  return axiosAuth.get("/post", { params });
};

postApi.getAllForUser = () => {
  return axiosClient.get("/post/get");
};

postApi.get = (id) => {
  return axiosClient.get(`/post/${id}`);
};

postApi.create = (postData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "post",
    new Blob([JSON.stringify(postData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("thumbnail", imgFile);
  }

  return axiosAuth.post("/post", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

postApi.update = (postId, postData, imgFile) => {
  const formData = new FormData();
  formData.append(
    "post",
    new Blob([JSON.stringify(postData)], { type: "application/json" })
  );
  if (imgFile) {
    formData.append("thumbnail", imgFile);
  }

  return axiosAuth.put(`/post/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete a Theater
postApi.delete = (postId) => {
  return axiosAuth.delete(`/post/${postId}`);
};

export default postApi;
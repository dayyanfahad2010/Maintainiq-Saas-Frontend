import axiosClient from "@/api/axiosClient";

export const getAssetsAPI = (params) =>
  axiosClient.get("/assets", { params }).then((res) => res.data);

export const getAssetByIdAPI = (id) =>
  axiosClient.get(`/assets/${id}`).then((res) => res.data);

export const createAssetAPI = (payload) =>
  axiosClient.post("/assets", payload).then((res) => res.data);

export const updateAssetAPI = ({ id, payload }) =>
  axiosClient.patch(`/assets/${id}`, payload).then((res) => res.data);

export const deleteAssetAPI = (id) =>
  axiosClient.delete(`/assets/${id}`).then((res) => res.data);

import axiosClient from "@/api/axiosClient";

const multipartConfig = { headers: { "Content-Type": undefined } };

export const createMaintenanceAPI = (payload) =>
  axiosClient
    .post("/maintenance", payload, payload instanceof FormData ? multipartConfig : undefined)
    .then((res) => res.data);

export const getMaintenanceByIssueAPI = (issueId) =>
  axiosClient.get(`/maintenance/${issueId}`).then((res) => res.data);

export const updateMaintenanceAPI = ({ id, payload }) =>
  axiosClient
    .patch(`/maintenance/${id}`, payload, payload instanceof FormData ? multipartConfig : undefined)
    .then((res) => res.data);

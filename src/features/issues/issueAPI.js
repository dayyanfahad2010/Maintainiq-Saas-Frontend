import axiosClient from "@/api/axiosClient";

export const getIssuesAPI = (params) =>
  axiosClient.get("/issue", { params }).then((res) => res.data);

export const getMyAssignedIssuesAPI = () =>
  axiosClient.get("/issue/technician/me").then((res) => res.data);

export const getIssueByIdAPI = (id) =>
  axiosClient.get(`/issue/${id}`).then((res) => res.data);

export const assignTechnicianAPI = ({ id, assignedTechnician }) =>
  axiosClient
    .patch(`/issue/${id}/assign`, { assignedTechnician })
    .then((res) => res.data);

export const updateIssueStatusAPI = ({ id, status }) =>
  axiosClient.patch(`/issue/${id}/status`, { status }).then((res) => res.data);

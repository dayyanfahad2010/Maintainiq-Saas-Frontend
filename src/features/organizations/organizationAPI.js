import axiosClient from "@/api/axiosClient";

export const getOrganizationsAPI = () =>
  axiosClient.get("/organizations").then((res) => res.data);

export const createOrganizationAPI = (payload) =>
  axiosClient.post("/organizations", payload).then((res) => res.data);

export const suspendOrganizationAPI = (id) =>
  axiosClient.patch(`/organizations/${id}/suspend`).then((res) => res.data);

export const activateOrganizationAPI = (id) =>
  axiosClient.patch(`/organizations/${id}/activate`).then((res) => res.data);

export const deleteOrganizationAPI = (id) =>
  axiosClient.delete(`/organizations/${id}`).then((res) => res.data);

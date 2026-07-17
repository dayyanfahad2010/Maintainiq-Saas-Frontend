import axiosClient from "@/api/axiosClient";

export const signUpAPI = (payload) =>
  axiosClient.post("/auth/signup", payload).then((res) => res.data);

export const loginAPI = (payload) =>
  axiosClient.post("/auth/login", payload).then((res) => res.data);

export const logoutAPI = () =>
  axiosClient.post("/auth/logout").then((res) => res.data);

export const profileAPI = () =>
  axiosClient.get("/auth/profile").then((res) => res.data);

export const forgotPasswordAPI = (payload) =>
  axiosClient.post("/auth/forgot-password", payload).then((res) => res.data);

export const resetPasswordAPI = (payload) =>
  axiosClient.post("/auth/reset-password", payload).then((res) => res.data);

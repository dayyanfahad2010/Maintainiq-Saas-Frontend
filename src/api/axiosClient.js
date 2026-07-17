import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalizes backend error shape { message } into a plain string the UI can show.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject({ ...error, message });
  }
);

export default axiosClient;

import axiosClient from "@/api/axiosClient";

export const getNotificationsAPI = () =>
  axiosClient.get("/notifications").then((res) => res.data);

export const getUnreadCountAPI = () =>
  axiosClient.get("/notifications/unread-count").then((res) => res.data);

export const markNotificationReadAPI = (id) =>
  axiosClient.patch(`/notifications/${id}/read`).then((res) => res.data);

export const markAllNotificationsReadAPI = () =>
  axiosClient.patch("/notifications/read-all").then((res) => res.data);

import { io } from "socket.io-client";
import { BASE_URL } from "./axiosClient";

let socket = null;

// Lazily creates (or reuses) a single Socket.IO connection for the whole
// app. Auth rides on the same httpOnly "token" cookie the REST API uses —
// withCredentials sends it along with the handshake, and the backend's
// socket.js middleware verifies it, so there's no separate token to manage
// here. Call this once the user is known to be authenticated (see
// RealtimeSync), and disconnectSocket() on logout.
export function getSocket() {
  if (!socket) {
    socket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

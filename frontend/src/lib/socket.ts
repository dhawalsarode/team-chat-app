import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  autoConnect: false
});

export function joinChannel(id: string) {
  socket.emit("join:channel", id);
}

export function leaveChannel(id: string) {
  socket.emit("leave:channel", id);
}

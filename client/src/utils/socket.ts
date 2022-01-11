import { io, Socket } from "socket.io-client";

export let socketChannel: Socket;

export const initializeSocket = (
  userId: string,
  roomId: string,
  onMessage?: (stringMessage: string) => void,
  onJoined?: () => void,
  onError?: () => void,
  onDisconnect?: () => void
) => {
  const socket = io("http://localhost:5500", {
    query: {
      userId,
      roomId,
    },
  });
  socket.on("connect", () => {
    if (onJoined) onJoined();
  });
  socket.on("connect_error", () => {
    setTimeout(() => socket.connect(), 5500);
    if (onError) onError();
  });

  socketChannel = socket.on("chat-room", (message: string) => {
    if (onMessage) onMessage(message);
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
    if (onDisconnect) onDisconnect();
  });
};

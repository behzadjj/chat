import { buffers, eventChannel } from "redux-saga";
import { io, Socket } from "socket.io-client";

type ISocketChannel = { [key: string]: Socket };

export let socketChannel: ISocketChannel = {
  chatRoom: undefined,
} as ISocketChannel;

export const initializeSocket = (userId: string, roomId: string) => {
  return io("http://localhost:5500", {
    query: {
      userId,
      roomId,
    },
  });
};

export const socketEventChannel = (socket: Socket) => {
  return eventChannel((emit) => {
    socket.on("connect", () => {
      console.log("connected");
    });

    const errorHandler = () => {
      setTimeout(() => socket.connect(), 5500);
    };
    const chatRoomHandler = (message: string) => {
      emit(message);
    };

    socket.on("connect_error", errorHandler);

    socketChannel.chatRoom = socket.on("chat-room", chatRoomHandler);
    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    const unsubscribe = () => {
      socket.off("chat-room", chatRoomHandler);
    };

    return unsubscribe;
  }, buffers.sliding(20));
};

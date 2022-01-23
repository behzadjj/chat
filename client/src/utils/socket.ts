import { io, Socket } from "socket.io-client";

import { Dispatch } from "@chat/redux";
import { receivedMessage, setRoomMembers } from "@chat/pages";
import { Message } from "@chat/implement";
import {
  IChatMessage,
  IMessages,
  IUserListMessage,
  MessageType,
} from "@chat/models";

export let socketChannel: Socket;

const defaultMessageHandler = (stringMessage: string) => {
  const message = Message.deserialize(stringMessage) as IMessages;

  if (message.type === MessageType.CHAT_MESSAGE) {
    Dispatch(receivedMessage(message as IChatMessage));
  }

  if (message.type === MessageType.USERS_LIST) {
    const usersMessage = message as IUserListMessage;
    Dispatch(setRoomMembers(usersMessage.payload.users));
  }
};

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
    if (onMessage) {
      onMessage(message);
    }
    defaultMessageHandler(message);
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
    if (onDisconnect) onDisconnect();
  });
};

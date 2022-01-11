import { nanoid } from "nanoid";
import { Socket } from "./../socket-initialization";

export const broadCastMemberList = (list: any) => {
  const io = Socket.io;

  const message = {
    id: nanoid(),
    payload: {
      users: list,
    },
    to: "all",
    sendDate: new Date(),
    type: 1,
  };
  io.to("chat-room").emit("chat-room", JSON.stringify(message));
};

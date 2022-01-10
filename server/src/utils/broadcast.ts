import { nanoid } from "nanoid";
import { appStorage } from "../appStorage";

export const broadCastMemberList = (list: any) => {
  const io = appStorage.get("io");

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

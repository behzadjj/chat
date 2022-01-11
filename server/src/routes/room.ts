import { Application } from "express";

import { broadCastMemberList } from "../utils/broadcast";
import { ChatRoom } from "../implementation/chat-room";

export const register = (app: Application) => {
  app.route("/chatroom/create").post((req, res) => {
    const result = ChatRoom.create(req.body.roomName, req.body.username);
    res.json(result);
  });

  app.route("/chatroom/leave").post((req, res) => {
    const room = ChatRoom.leave(req.body.roomId, req.body.userId);
    broadCastMemberList(room.members);
    res.json();
  });

  app.route("/chatroom/join").post((req, res) => {
    const result = ChatRoom.join(req.body.username, req.body.roomId);
    broadCastMemberList(result.room.members);
    res.json(result);
  });
};

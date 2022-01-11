import { Application } from "express";

import { appStorage } from "../appStorage";
import { broadCastMemberList } from "../utils/broadcast";
import { ChatRoom } from "../utils/chat-room";

appStorage.set("rooms", []);

export const register = (app: Application) => {
  app.route("/chatroom/create").post((req, res) => {
    const room = ChatRoom.create(req.body.roomName, req.body.username);
    res.json(room);
  });

  app.route("/chatroom/leave").post((req, res) => {
    const room = ChatRoom.leave(req.body.roomId, req.body.userId);
    broadCastMemberList(room.members);
    res.json();
  });

  app.route("/chatroom/join").post((req, res) => {
    const join = ChatRoom.join(req.body.username, req.body.roomId);
    broadCastMemberList(join.members);
    res.json(join);
  });
};

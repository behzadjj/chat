import { Application } from "express";
import { nanoid } from "nanoid";

import { appStorage } from "../appStorage";
import { broadCastMemberList } from "../utils/broadcast";

appStorage.set("rooms", []);

const findRoomById = (roomId: string) => {
  const rooms = appStorage.get("rooms");
  const room = rooms.find((x: any) => x.roomId === roomId);

  if (!room) {
    throw new Error("BROKEN"); // Express will catch this on its own.
  }

  return room;
};

export const register = (app: Application) => {
  app.route("/chatroom/create").post((req, res) => {
    const rooms = appStorage.get("rooms");
    const userId = nanoid();
    const roomId = nanoid();
    const room = {
      roomId,
      roomName: req.body.roomName,
      creator: userId,
      members: [
        {
          name: req.body.username,
          rule: "moderator",
          userId,
        },
      ],
    };
    rooms.push(room);
    appStorage.set("rooms", rooms);

    res.json({ userId, roomId, members: room.members });
  });

  app.route("/chatroom/leave").post((req, res) => {
    const room = findRoomById(req.body.roomId);
    const userIndex = room.members.findIndex(
      (x: any) => x.userId === req.body.userId
    );
    room.members.splice(userIndex, 1);
    broadCastMemberList(room.members);
    res.json();
  });

  app.route("/chatroom/join").post((req, res) => {
    const room = findRoomById(req.body.roomId);

    const userId = nanoid();

    room.members.push({
      name: req.body.username,
      rule: "member",
      userId,
    });
    broadCastMemberList(room.members);

    res.json({
      userId,
      roomId: req.body.roomId,
      roomName: room.roomName,
      members: room.members,
    });
  });
};

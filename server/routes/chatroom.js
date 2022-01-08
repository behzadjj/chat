const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const chatroomRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

var { nanoid } = require("nanoid");
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

const appStorage = require("../app-storage");

appStorage.set("rooms", []);

chatroomRoutes.route("/chatroom/create").post(function (req, res) {
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

chatroomRoutes.route("/chatroom/join").post(function (req, res) {
  const rooms = appStorage.get("rooms");

  const room = rooms.find((x) => x.roomId === req.body.roomId);

  if (!room) {
    throw new Error("BROKEN"); // Express will catch this on its own.
  }

  const userId = nanoid();

  room.members.push({
    name: req.body.username,
    rule: "member",
    userId,
  });
  appStorage.set(rooms);
  broadCastMemberList(room.members);

  res.json({
    userId,
    roomId: req.body.roomId,
    roomName: room.roomName,
    members: room.members,
  });
});

const broadCastMemberList = (list) => {
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

module.exports = chatroomRoutes;

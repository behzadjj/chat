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

const cache = new Map();

cache.set("rooms", []);

chatroomRoutes.route("/chatroom/create").post(function (req, res) {
  const rooms = cache.get("rooms");
  const userId = nanoid();
  const roomId = nanoid();
  rooms.push({
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
  });
  cache.set(rooms);

  res.json({ userId, roomId });
});

chatroomRoutes.route("/chatroom/join").post(function (req, res) {
  const rooms = cache.get("rooms");

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
  cache.set(rooms);

  res.json({ userId, roomId: req.body.roomId, roomName: room.roomName });
});

module.exports = chatroomRoutes;

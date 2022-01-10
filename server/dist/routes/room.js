"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const nanoid_1 = require("nanoid");
const appStorage_1 = require("../appStorage");
const broadcast_1 = require("../utils/broadcast");
appStorage_1.appStorage.set("rooms", []);
const findRoomById = (roomId) => {
    const rooms = appStorage_1.appStorage.get("rooms");
    const room = rooms.find((x) => x.roomId === roomId);
    if (!room) {
        throw new Error("BROKEN"); // Express will catch this on its own.
    }
    return room;
};
const register = (app) => {
    app.route("/chatroom/create").post((req, res) => {
        const rooms = appStorage_1.appStorage.get("rooms");
        const userId = (0, nanoid_1.nanoid)();
        const roomId = (0, nanoid_1.nanoid)();
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
        appStorage_1.appStorage.set("rooms", rooms);
        res.json({ userId, roomId, members: room.members });
    });
    app.route("/chatroom/leave").post((req, res) => {
        const room = findRoomById(req.body.roomId);
        const userIndex = room.members.findIndex((x) => x.userId === req.body.userId);
        room.members.splice(userIndex, 1);
        (0, broadcast_1.broadCastMemberList)(room.members);
        res.json();
    });
    app.route("/chatroom/join").post((req, res) => {
        const room = findRoomById(req.body.roomId);
        const userId = (0, nanoid_1.nanoid)();
        room.members.push({
            name: req.body.username,
            rule: "member",
            userId,
        });
        (0, broadcast_1.broadCastMemberList)(room.members);
        res.json({
            userId,
            roomId: req.body.roomId,
            roomName: room.roomName,
            members: room.members,
        });
    });
};
exports.register = register;
//# sourceMappingURL=room.js.map
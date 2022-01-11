"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const appStorage_1 = require("../appStorage");
const broadcast_1 = require("../utils/broadcast");
const chat_room_1 = require("../utils/chat-room");
appStorage_1.appStorage.set("rooms", []);
const register = (app) => {
    app.route("/chatroom/create").post((req, res) => {
        const room = chat_room_1.ChatRoom.create(req.body.roomName, req.body.username);
        res.json(room);
    });
    app.route("/chatroom/leave").post((req, res) => {
        const room = chat_room_1.ChatRoom.leave(req.body.roomId, req.body.userId);
        (0, broadcast_1.broadCastMemberList)(room.members);
        res.json();
    });
    app.route("/chatroom/join").post((req, res) => {
        const join = chat_room_1.ChatRoom.join(req.body.username, req.body.roomId);
        (0, broadcast_1.broadCastMemberList)(join.members);
        res.json(join);
    });
};
exports.register = register;
//# sourceMappingURL=room.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadCastMemberList = void 0;
const nanoid_1 = require("nanoid");
const socket_initialization_1 = require("./../socket-initialization");
const broadCastMemberList = (list) => {
    const io = socket_initialization_1.Socket.io;
    const message = {
        id: (0, nanoid_1.nanoid)(),
        payload: {
            users: list,
        },
        to: "all",
        sendDate: new Date(),
        type: 1,
    };
    io.to("chat-room").emit("chat-room", JSON.stringify(message));
};
exports.broadCastMemberList = broadCastMemberList;
//# sourceMappingURL=broadcast.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoom = void 0;
const nanoid_1 = require("nanoid");
class ChatRoomClass {
    constructor() {
        this.rooms = [];
        this.findRoomById = (roomId) => {
            const room = this.rooms.find((x) => x.roomId === roomId);
            if (!room) {
                throw new Error("BROKEN"); // Express will catch this on its own.
            }
            return room;
        };
    }
    static get Instance() {
        if (!ChatRoomClass.instance)
            ChatRoomClass.instance = new ChatRoomClass();
        return ChatRoomClass.instance;
    }
    create(roomName, creatorName) {
        const userId = (0, nanoid_1.nanoid)();
        const roomId = (0, nanoid_1.nanoid)();
        const room = {
            roomId,
            roomName,
            creator: userId,
            members: [
                {
                    name: creatorName,
                    rule: "moderator",
                    userId,
                },
            ],
        };
        this.rooms.push(room);
        return room;
    }
    join(memberName, roomId) {
        const room = this.findRoomById(roomId);
        const userId = (0, nanoid_1.nanoid)();
        room.members.push({
            name: memberName,
            rule: "member",
            userId,
        });
        return Object.assign({ userId }, room);
    }
    leave(roomId, userId) {
        const room = this.findRoomById(roomId);
        const userIndex = room.members.findIndex((x) => x.userId === userId);
        room.members.splice(userIndex, 1);
        return room;
    }
}
exports.ChatRoom = ChatRoomClass.Instance;
//# sourceMappingURL=chat-room.js.map
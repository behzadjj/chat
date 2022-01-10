"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = exports.SocketClass = void 0;
const socket_io_1 = require("socket.io");
const server_initialization_1 = require("./server.initialization");
const http_1 = __importDefault(require("http"));
const appStorage_1 = require("./appStorage");
const conn_1 = require("./db/conn");
const broadcast_1 = require("./utils/broadcast");
const setConnection = (userId, roomId, connectionId) => {
    const connections = appStorage_1.appStorage.get("connections") || {};
    const connection = {
        roomId,
        userId,
        connectionId,
    };
    connections[connectionId] = connection;
    appStorage_1.appStorage.set("connections", connections);
};
const removeConnection = (connectionId) => {
    const connections = appStorage_1.appStorage.get("connections");
    const rooms = appStorage_1.appStorage.get("rooms");
    if (!connections || !rooms || !connections[connectionId]) {
        return;
    }
    const room = rooms.find((x) => x.roomId === connections[connectionId].roomId);
    if (!room) {
        return;
    }
    const index = room.members.findIndex((x) => x.userId === connections[connectionId].userId);
    room.members = room.members.splice(index, 1);
    (0, broadcast_1.broadCastMemberList)(room.members);
};
class SocketClass {
    constructor() {
        this.server = http_1.default.createServer(server_initialization_1.Server.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "http://localhost:3000",
            },
        });
        this.io.on("connection", (socket) => {
            // tslint:disable-next-line:no-console
            console.log("client connected: ", socket.id);
            setConnection(socket.handshake.query.userId, socket.handshake.query.roomId, socket.id);
            socket.join("chat-room");
            socket.on("chat-room", (data) => {
                const message = JSON.parse(data);
                // const messageId = nanoid();
                const room = appStorage_1.appStorage
                    .get("rooms")
                    .find((x) => x.roomId === message.payload.roomId);
                appStorage_1.appStorage.set("io", this.io);
                if (!room) {
                    return;
                }
                const doConnect = conn_1.Db.getInstance().getDb();
                // message.messageId = messageId;
                doConnect.collection("chat").insertOne(message, (err) => {
                    if (err)
                        throw err;
                    this.io.to("chat-room").emit("chat-room", JSON.stringify(message));
                });
            });
            socket.on("disconnect", (reason) => {
                removeConnection(socket.id);
                // tslint:disable-next-line:no-console
                console.log(reason);
            });
        });
    }
    static get Instance() {
        if (!SocketClass.instance)
            SocketClass.instance = new SocketClass();
        return SocketClass.instance;
    }
    register() {
        this.server.listen(SocketClass.WSPort, (err) => {
            if (err) {
                // tslint:disable-next-line:no-console
                console.log(err);
            }
            // tslint:disable-next-line:no-console
            console.log("Server running on Port ", SocketClass.WSPort);
        });
    }
}
exports.SocketClass = SocketClass;
SocketClass.WSPort = 5500;
exports.Socket = SocketClass.Instance;
//# sourceMappingURL=socket-initialization.js.map
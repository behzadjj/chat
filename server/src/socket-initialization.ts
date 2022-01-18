import { Server } from "socket.io";
import http from "http";

import { appStorage } from "./utils/app-storage";
import { Db } from "./db/conn";
import { broadCastMemberList } from "./utils/broadcast";
import { ChatRoom } from "./implementation/chat-room";

export class SocketClass {
  private static WSPort = 5500;
  private static instance: SocketClass;

  private connections: { [key: string]: { userId: string; roomId: string } } =
    {};

  public static get Instance() {
    if (!SocketClass.instance) SocketClass.instance = new SocketClass();

    return SocketClass.instance;
  }

  io: Server;
  server: any;

  private constructor() {}

  setConnection(userId: string, roomId: string, connectionId: string) {
    this.connections[connectionId] = {
      roomId,
      userId,
    };
  }

  removeConnection(connectionId: any) {
    const connections = this.connections;
    if (!connections || !ChatRoom.rooms || !connections[connectionId]) {
      return;
    }

    const room = ChatRoom.leave(
      connections[connectionId].roomId,
      connections[connectionId].userId
    );
    connections[connectionId] = undefined;
    if (room) {
      broadCastMemberList(room.members);
    }
  }

  register(app: any) {
    this.server = http.createServer(app);
    this.io = new Server(this.server, {
      cors: {
        origin: "http://localhost:3000",
      },
    });
    this.io.on("connection", (socket) => {
      // tslint:disable-next-line:no-console
      console.log("client connected: ", socket.id);
      this.setConnection(
        socket.handshake.query.userId as string,
        socket.handshake.query.roomId as string,
        socket.id
      );
      socket.join("chat-room");

      socket.on("chat-room", (data) => {
        console.log(data);
        const message = JSON.parse(data);
        // const messageId = nanoid();

        console.log(message.payload.roomId);
        const room = ChatRoom.rooms.find(
          (x: any) => x.roomId === message.payload.roomId
        );

        appStorage.set("io", this.io);
        if (!room) {
          return;
        }
        const doConnect = Db.getDb();
        // message.messageId = messageId;

        doConnect.collection("chat").insertOne(message, (err) => {
          if (err) throw err;
          this.io.to("chat-room").emit("chat-room", JSON.stringify(message));
        });
      });

      socket.on("disconnect", (reason) => {
        this.removeConnection(socket.id);
        console.log(reason);
      });
    });
    this.server.listen(SocketClass.WSPort, (err: any) => {
      if (err) {
        console.log(err);
      }
      console.log("Server running on Port ", SocketClass.WSPort);
    });
  }
}

export const Socket = SocketClass.Instance;

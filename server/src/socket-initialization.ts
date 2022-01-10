import { Server } from "socket.io";
import { Server as WebServer } from "./server.initialization";
import http from "http";

import { appStorage } from "./appStorage";
import { Db } from "./db/conn";
import { broadCastMemberList } from "./utils/broadcast";

const setConnection = (
  userId: string,
  roomId: string,
  connectionId: string
) => {
  const connections = appStorage.get("connections") || {};
  const connection = {
    roomId,
    userId,
    connectionId,
  };

  connections[connectionId] = connection;

  appStorage.set("connections", connections);
};

const removeConnection = (connectionId: any) => {
  const connections = appStorage.get("connections");

  const rooms = appStorage.get("rooms");
  if (!connections || !rooms || !connections[connectionId]) {
    return;
  }
  const room = rooms.find(
    (x: any) => x.roomId === connections[connectionId].roomId
  );

  if (!room) {
    return;
  }
  const index = room.members.findIndex(
    (x: any) => x.userId === connections[connectionId].userId
  );

  room.members = room.members.splice(index, 1);

  broadCastMemberList(room.members);
};

export class SocketClass {
  private static WSPort = 5500;
  private static instance: SocketClass;

  public static get Instance() {
    if (!SocketClass.instance) SocketClass.instance = new SocketClass();

    return SocketClass.instance;
  }

  io: Server;
  server: any;

  private constructor() {
    this.server = http.createServer(WebServer.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "http://localhost:3000",
      },
    });
    this.io.on("connection", (socket) => {
      // tslint:disable-next-line:no-console
      console.log("client connected: ", socket.id);
      setConnection(
        socket.handshake.query.userId as string,
        socket.handshake.query.roomId as string,
        socket.id
      );
      socket.join("chat-room");

      socket.on("chat-room", (data) => {
        const message = JSON.parse(data);
        // const messageId = nanoid();

        const room = appStorage
          .get("rooms")
          .find((x: any) => x.roomId === message.payload.roomId);

        appStorage.set("io", this.io);
        if (!room) {
          return;
        }
        const doConnect = Db.getInstance().getDb();
        // message.messageId = messageId;

        doConnect.collection("chat").insertOne(message, (err) => {
          if (err) throw err;
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

  register() {
    this.server.listen(SocketClass.WSPort, (err: any) => {
      if (err) {
        // tslint:disable-next-line:no-console
        console.log(err);
      }
      // tslint:disable-next-line:no-console
      console.log("Server running on Port ", SocketClass.WSPort);
    });
  }
}

export const Socket = SocketClass.Instance;

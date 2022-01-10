const { nanoid } = require("nanoid");
const http = require("http");
const socketIo = require("socket.io");
// This will help us connect to the database
const dbo = require("./db/conn");

const appStorage = require("./app-storage");

const broadCastMemberList = require("./tools/broadcast");

const WSPort = process.env.WS_PORT || 5500;

const app = appStorage.get("app");

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
  },
}); //in case server and client run on different urls

const setConnection = (userId, roomId, connectionId) => {
  const connections = appStorage.get("connections") || {};
  const connection = {
    roomId,
    userId,
    connectionId,
  };

  connections[connectionId] = connection;

  appStorage.set("connections", connections);
};

const removeConnection = (connectionId) => {
  const connections = appStorage.get("connections");

  const rooms = appStorage.get("rooms");
  if (!connections || !rooms || !connections[connectionId]) {
    return;
  }
  const room = rooms.find((x) => x.roomId === connections[connectionId].roomId);

  if (!room) {
    return;
  }
  const index = room.members.findIndex(
    (x) => x.userId === connections[connectionId].userId
  );

  room.members = room.members.splice(index, 1);

  broadCastMemberList(room.members);
};

appStorage.set("io", io);
io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);
  setConnection(
    socket.handshake.query.userId,
    socket.handshake.query.roomId,
    socket.id
  );
  socket.join("chat-room");

  socket.on("chat-room", (data) => {
    const message = JSON.parse(data);
    // const messageId = nanoid();

    const room = appStorage
      .get("rooms")
      .find((x) => x.roomId === message.payload.roomId);

    appStorage.set("io", io);
    if (!room) {
      return;
    }
    let db_connect = dbo.getDb();
    // message.messageId = messageId;

    db_connect.collection("chat").insertOne(message, function (err) {
      if (err) throw err;
      io.to("chat-room").emit("chat-room", JSON.stringify(message));
    });
  });

  socket.on("disconnect", (reason) => {
    removeConnection(socket.id);
    console.log(reason);
  });
});
server.listen(WSPort, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", WSPort);
});

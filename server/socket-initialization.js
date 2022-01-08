const { nanoid } = require("nanoid");
const http = require("http");
const socketIo = require("socket.io");
// This will help us connect to the database
const dbo = require("./db/conn");

const appStorage = require("./app-storage");

const WSPort = process.env.WS_PORT || 5500;

const app = appStorage.get("app");

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
  },
}); //in case server and client run on different urls
io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);

  socket.join("chat-room");

  socket.on("chat-room", (data) => {
    const message = JSON.parse(data);
    // const messageId = nanoid();

    const room = appStorage
      .get("rooms")
      .find((x) => x.roomId === message.payload.roomId);

    console.log(message);
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
    console.log(reason);
  });
});
server.listen(WSPort, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", WSPort);
});

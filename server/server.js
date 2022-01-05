const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

const WSPort = process.env.WS_PORT || 5500;

const cache = require("./cache");

app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));
app.use(require("./routes/chatroom"));
// get driver connection
const dbo = require("./db/conn");
const { nanoid } = require("nanoid");

app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});

// initialize socket

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

    const room = cache.get("rooms").find((x) => x.roomId === message.roomId);

    if (!room) {
      return;
    }

    const member = room.members.find((x) => x.userId === message.userId);

    if (!member) {
      return;
    }

    const forwardMessage = {
      roomId: message.roomId,
      sendingDate: message.sendingDate,
      text: message.text,
      userName: member.name,
      messageId: nanoid(),
    };

    io.to("chat-room").emit("chat-room", JSON.stringify(forwardMessage));
  });

  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
});
server.listen(WSPort, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", WSPort);
});

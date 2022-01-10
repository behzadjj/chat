const appStorage = require("../app-storage");
var { nanoid } = require("nanoid");

const broadCastMemberList = (list) => {
  const io = appStorage.get("io");

  const message = {
    id: nanoid(),
    payload: {
      users: list,
    },
    to: "all",
    sendDate: new Date(),
    type: 1,
  };
  io.to("chat-room").emit("chat-room", JSON.stringify(message));
};

module.exports = broadCastMemberList;

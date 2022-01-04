import { useState } from "react";
import { io } from "socket.io-client";

import { Gate, UsersList, MessageForm } from "./components";
import { UserMessages } from "./components/UserMessages";

let socketChannel: any = undefined;

export const Chat = () => {
  const [joined, setJoined] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);

  console.log({ chatMessages });

  const handleUserJoined = () => {
    const socket = io("http://localhost:5500");
    socket.on("connect", () => {
      setJoined(true);
    });
    socket.on("connect_error", () => {
      setTimeout(() => socket.connect(), 5500);
    });

    socketChannel = socket.on("chat-room", (message: string) => {
      setChatMessages((prevState) => [...prevState, message]);
      console.log(chatMessages);
    });
    socketChannel.connect();
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  };

  const handleMessageSent = (message: string) => {
    if (socketChannel) {
      socketChannel.emit("chat-room", message);
      console.log(message);
    }
  };

  return (
    <>
      {!joined && (
        <section>
          <Gate onJoin={handleUserJoined}></Gate>
        </section>
      )}

      {joined && (
        <section>
          <UsersList></UsersList>

          <UserMessages messages={chatMessages}></UserMessages>

          <MessageForm onMessage={handleMessageSent}></MessageForm>
        </section>
      )}
    </>
  );
};

import { useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

import { Gate, UsersList, MessageForm, GateModes } from "./components";
import { UserMessages } from "./components/UserMessages";

let socketChannel: any = undefined;

export const Chat = () => {
  const [joined, setJoined] = useState(false);

  const [gateMode, setGateMode] = useState<GateModes>();

  const [room, setRoom] =
    useState<{ roomName: string; roomId: string; userId: string }>();

  const [chatMessages, setChatMessages] = useState([]);

  console.log({ chatMessages });

  const handleRoomCreated = (username: string, roomName: string) => {
    axios
      .post("http://localhost:5000/chatroom/create", {
        username,
        roomName,
      })
      .then((res) => {
        setRoom({
          roomName,
          roomId: res.data.roomId,
          userId: res.data.userId,
        });
        const socket = io("http://localhost:5500");
        socket.on("connect", () => {
          setJoined(true);
        });
        socket.on("connect_error", () => {
          setTimeout(() => socket.connect(), 5500);
        });

        socketChannel = socket.on("chat-room", (message: string) => {
          setChatMessages((prevState) => [...prevState, message]);
        });
        socket.on("disconnect", () => {
          console.log("disconnected");
        });
      });
  };

  const handleUserJoined = (username: string, roomId: string) => {
    axios
      .post("http://localhost:5000/chatroom/join", {
        username,
        roomId,
      })
      .then((res) => {
        setRoom({
          roomName: res.data.roomName,
          roomId: res.data.roomId,
          userId: res.data.userId,
        });
        const socket = io("http://localhost:5500");
        socket.on("connect", () => {
          setJoined(true);
        });
        socket.on("connect_error", () => {
          setTimeout(() => socket.connect(), 5500);
        });

        socketChannel = socket.on("chat-room", (message: string) => {
          setChatMessages((prevState) => [...prevState, message]);
        });
        socket.on("disconnect", () => {
          console.log("disconnected");
        });
      });
  };

  const handleMessageSent = (message: string) => {
    if (socketChannel) {
      socketChannel.emit("chat-room", message);
      console.log(message);
    }
  };

  const handleJoinModeClicked = () => setGateMode(GateModes.JOIN);

  const handleCreateModeClicked = () => setGateMode(GateModes.CREATE);

  return (
    <>
      {gateMode === undefined && (
        <>
          <button onClick={handleJoinModeClicked}>Join Room</button>

          <button onClick={handleCreateModeClicked}>Create Room</button>
        </>
      )}

      {!joined && gateMode !== undefined && (
        <section>
          <Gate
            gateMode={gateMode}
            onCreate={handleRoomCreated}
            onJoin={handleUserJoined}
          ></Gate>
          <button
            onClick={() => {
              setGateMode(undefined);
            }}
          >
            Back
          </button>
        </section>
      )}

      {joined && (
        <section>
          <h1>room name: {room.roomName}</h1>

          <UsersList></UsersList>

          <UserMessages messages={chatMessages}></UserMessages>

          <MessageForm onMessage={handleMessageSent}></MessageForm>
        </section>
      )}
    </>
  );
};

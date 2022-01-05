import { FC, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

import { Gate, UsersList, MessageForm, GateModes } from "./components";
import { ChatMessage, UserMessages } from "./components/UserMessages";

let socketChannel: any = undefined;

type Room = {
  roomName: string;
  roomId: string;
  userId: string;
  roomLink?: string;
  isCreator: boolean;
};

export const Chat: FC<any> = (props) => {
  const [joined, setJoined] = useState(false);
  const [gateMode, setGateMode] = useState<GateModes>();
  const [room, setRoom] = useState<Room>();
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (props.match.params && props.match.params.roomId) {
      setGateMode(GateModes.JOIN);
    }
  }, [props.match.params]);

  const initializeSocket = () => {
    const socket = io("http://localhost:5500");
    socket.on("connect", () => {
      setJoined(true);
    });
    socket.on("connect_error", () => {
      setTimeout(() => socket.connect(), 5500);
    });

    socketChannel = socket.on("chat-room", (stringMessage: string) => {
      const message = JSON.parse(stringMessage) as ChatMessage;
      setChatMessages((prevState) => [...prevState, message]);
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  };

  const handleRoomCreated = (username: string, roomName: string) => {
    axios
      .post("http://localhost:5000/chatroom/create", {
        username,
        roomName,
      })
      .then((res) => {
        const roomLink =
          document.location.protocol +
          "//" +
          document.location.host +
          "/chat/" +
          res.data.roomId;
        console.log(roomLink);
        setRoom({
          roomName,
          roomId: res.data.roomId,
          userId: res.data.userId,
          roomLink,
          isCreator: true,
        });

        navigator.clipboard.writeText(roomLink);
        initializeSocket();
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
          isCreator: false,
        });
        initializeSocket();
      });
  };

  const handleMessageSent = (text: string) => {
    if (socketChannel) {
      const message: ChatMessage = {
        roomId: room.roomId,
        text,
        userId: room.userId,
        sendingDate: new Date(),
      };

      socketChannel.emit("chat-room", JSON.stringify(message));
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
            roomId={props.match.params.roomId}
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

          {room.isCreator && (
            <h3>
              Room link: <a href={room.roomLink}>Room</a>
            </h3>
          )}

          <UsersList></UsersList>

          <UserMessages messages={chatMessages}></UserMessages>

          <MessageForm onMessage={handleMessageSent}></MessageForm>
        </section>
      )}
    </>
  );
};

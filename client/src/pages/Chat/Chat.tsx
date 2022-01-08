import { FC, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

import { Gate, UsersList, MessageForm, GateModes } from "./components";
import { UserMessages } from "./components/UserMessages";
import {
  IChatMessage,
  IChatMessagePayload,
  IMessages,
  IUserListMessage,
  MessageType,
} from "@chat/models";
import { Message } from "@chat/implement";

let socketChannel: any = undefined;

type Room = {
  roomName: string;
  roomId: string;
  userId: string;
  roomLink?: string;
  isCreator: boolean;
  users: Array<{ name: string; userId: string }>;
};

export const Chat: FC<any> = (props) => {
  const [joined, setJoined] = useState(false);
  const [gateMode, setGateMode] = useState<GateModes>();
  const [room, setRoom] = useState<Room>();
  const [chatMessages, setChatMessages] = useState<Array<IChatMessage>>([]);

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
      const message = Message.deserialize(stringMessage) as IMessages;

      console.log(stringMessage);

      if (message.type === MessageType.CHAT_MESSAGE) {
        const chatMessage = message as IChatMessage;
        setChatMessages((prevState) => [...prevState, chatMessage]);
      }

      if (message.type === MessageType.USERS_LIST) {
        const usersMessage = message as IUserListMessage;
        setRoom((prevState) => ({
          ...prevState,
          users: usersMessage.payload.users,
        }));
      }
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
          "/" +
          res.data.roomId;
        setRoom({
          roomName,
          roomId: res.data.roomId,
          userId: res.data.userId,
          roomLink,
          isCreator: true,
          users: res.data.members,
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
        const roomLink =
          document.location.protocol +
          "//" +
          document.location.host +
          "/" +
          res.data.roomId;

        setRoom({
          roomName: res.data.roomName,
          roomId: res.data.roomId,
          userId: res.data.userId,
          isCreator: false,
          roomLink,
          users: res.data.members,
        });
        initializeSocket();
      });
  };

  const handleMessageSent = (text: string) => {
    if (socketChannel) {
      const message = new Message<IChatMessagePayload>(
        room.userId,
        MessageType.CHAT_MESSAGE,
        "all",
        {
          text,
          chatMessageType: "TEXT",
          roomId: room.roomId,
        }
      );

      socketChannel.emit("chat-room", Message.serialize(message));
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

          {room && (
            <h3>
              Room link: <a href={room.roomLink}>Room</a>
            </h3>
          )}

          <UsersList list={room.users}></UsersList>

          <UserMessages messages={chatMessages}></UserMessages>

          <MessageForm onMessage={handleMessageSent}></MessageForm>
        </section>
      )}
    </>
  );
};

import { FC, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

import { Gate, UsersList, MessageForm } from "./components";
import { UserMessages } from "./components/UserMessages";

import {
  IChatMessage,
  IChatMessagePayload,
  IMessages,
  IUserListMessage,
  MessageType,
  RoomUsers,
} from "@chat/models";
import { Message } from "@chat/implement";

import "./chat.scss";

let socketChannel: any = undefined;

type Room = {
  roomName: string;
  roomId: string;
  user: RoomUsers;
  roomLink?: string;
  isCreator: boolean;
  users: Array<RoomUsers>;
};

export const Chat: FC<any> = (props) => {
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState<Room>();
  const [chatMessages, setChatMessages] = useState<Array<IChatMessage>>([]);

  const cl = (stringMessage: string) => {
    const message = Message.deserialize(stringMessage) as IMessages;

    if (message.type === MessageType.CHAT_MESSAGE) {
      setChatMessages((prevState) => [...prevState, message as IChatMessage]);
    }

    if (message.type === MessageType.USERS_LIST) {
      const usersMessage = message as IUserListMessage;
      setRoom((prevState) => ({
        ...prevState,
        users: usersMessage.payload.users,
      }));
    }
  };

  const initializeSocket = () => {
    const socket = io("http://localhost:5500");
    socket.on("connect", () => {
      setJoined(true);
    });
    socket.on("connect_error", () => {
      setTimeout(() => socket.connect(), 5500);
    });

    socketChannel = socket.on("chat-room", cl);
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
          user: {
            userId: res.data.userId,
            name: username,
          },
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
          user: {
            userId: res.data.userId,
            name: username,
          },
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
        room.user,
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

  return (
    <>
      <div className='chat'>
        <div className='chat__gate-container'>
          {!joined && (
            <section>
              <Gate
                onCreate={handleRoomCreated}
                onJoin={handleUserJoined}
                roomId={props.match.params.roomId}
              ></Gate>
            </section>
          )}
        </div>

        <div className='chat__room-container'>
          {joined && (
            <section className='room'>
              <header className='room__header'>
                <h1>room name: {room.roomName}</h1>

                {room && (
                  <h3>
                    Room link: <a href={room.roomLink}>Room</a>
                  </h3>
                )}
              </header>

              <main className='room__main'>
                <div className='room__main--user-list'>
                  <UsersList list={room.users}></UsersList>
                </div>

                <div className='room__main--chat-messages'>
                  <UserMessages messages={chatMessages}></UserMessages>
                </div>
              </main>

              <footer className='room__footer'>
                <MessageForm onMessage={handleMessageSent}></MessageForm>
              </footer>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

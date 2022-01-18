import { FC, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Gate, UsersList, MessageForm } from "./components";
import { UserMessages } from "./components/UserMessages";
import {
  ICallInvitationPayload,
  ICallMessage,
  IChatMessage,
  IChatMessagePayload,
  IMessages,
  IUserListMessage,
  MessageType,
  RoomUsers,
} from "@chat/models";
import { Message } from "@chat/implement";
import { initializeSocket, socketChannel, WebRtc } from "@chat/utils";

import "./chat.scss";

type Room = {
  roomName: string;
  roomId: string;
  user: RoomUsers;
  roomLink?: string;
  isCreator: boolean;
  members: Array<RoomUsers>;
};

export const Chat: FC = () => {
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState<Room>();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<Array<IChatMessage>>([]);
  const messageBox = useRef<HTMLDivElement>();
  useEffect(() => {
    if (messageBox && messageBox.current) {
      messageBox.current.scrollTo(0, messageBox.current.scrollHeight);
    }
  }, [chatMessages]);

  const getRoom = () => room;

  const onMessage = (stringMessage: string) => {
    console.log(room);
    const message = Message.deserialize(stringMessage) as IMessages;

    if (message.type === MessageType.CHAT_MESSAGE) {
      setChatMessages((prevState) => [...prevState, message as IChatMessage]);
    }

    if (message.type === MessageType.USERS_LIST) {
      const usersMessage = message as IUserListMessage;
      setRoom((prevState) => {
        return {
          ...prevState,
          members: usersMessage.payload.users,
        };
      });
    }

    if (message.type === MessageType.CALL_ANSWER) {
      console.log(message, getRoom());
      const index = (message.to as Array<RoomUsers>).findIndex(
        (x) => x.userId === room.user.userId
      );

      if (index === -1) {
        return;
      }

      let localStream: MediaStream = null;
      const callInvitation = message as ICallMessage;
      const desc = new RTCSessionDescription(callInvitation.payload.sdp);

      const myPeerConnection = WebRtc.Instance.myPeerConnection;

      myPeerConnection
        .setRemoteDescription(desc)
        .then(() => {
          return navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        })
        .then((stream) => {
          localStream = stream;
          const videoElement: HTMLVideoElement = document.getElementById(
            "local_video"
          ) as HTMLVideoElement;
          videoElement.srcObject = localStream;

          localStream
            .getTracks()
            .forEach((track) => myPeerConnection.addTrack(track, localStream));
        });
    }

    if (message.type === MessageType.CALL_INVITATION) {
      setRoom((prevState) => {
        return prevState;
      });
      const index = (message.to as Array<RoomUsers>).findIndex(
        (x) => x.userId === room.user.userId
      );

      if (index === -1) {
        return;
      }
      let localStream: MediaStream = null;
      WebRtc.Instance.createPeerConnection();
      const callInvitation = message as ICallMessage;
      const caller = message.from;
      const desc = new RTCSessionDescription(callInvitation.payload.sdp);

      const myPeerConnection = WebRtc.Instance.myPeerConnection;

      myPeerConnection
        .setRemoteDescription(desc)
        .then(() => {
          return navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        })
        .then((stream) => {
          localStream = stream;
          const videoElement: HTMLVideoElement = document.getElementById(
            "local_video"
          ) as HTMLVideoElement;
          videoElement.srcObject = localStream;

          localStream
            .getTracks()
            .forEach((track) => myPeerConnection.addTrack(track, localStream));
        })
        .then(() => {
          return myPeerConnection.createAnswer();
        })
        .then((answer) => {
          return myPeerConnection.setLocalDescription(answer);
        })
        .then(() => {
          const message = new Message<ICallInvitationPayload>(
            room.user,
            MessageType.CALL_ANSWER,
            [caller],
            {
              sdp: myPeerConnection.localDescription,
              roomId: room.roomId,
            }
          );

          socketChannel.emit("chat-room", Message.serialize(message));
        });
    }
  };

  const onJoined = () => {
    setJoined(true);
  };

  const prepareRoom = (
    room: Room,
    userId: string,
    username: string,
    isCreator: boolean
  ) => {
    const roomLink = `${document.location.protocol}//${document.location.host}/${room.roomId}`;
    setRoom({
      ...room,
      user: {
        userId,
        name: username,
      },
      isCreator,
      roomLink,
    });
    navigator.clipboard.writeText(roomLink);
    initializeSocket(userId, room.roomId, onMessage, onJoined);
  };

  const handleRoomCreated = (username: string, roomName: string) => {
    axios
      .post("http://localhost:5000/chatroom/create", {
        username,
        roomName,
      })
      .then((res) => {
        prepareRoom(res.data.room, res.data.userId, username, true);
      });
  };

  const handleUserJoined = (username: string, roomId: string) => {
    axios
      .post("http://localhost:5000/chatroom/join", {
        username,
        roomId,
      })
      .then((res) => {
        prepareRoom(res.data.room, res.data.userId, username, false);
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

  const handleLeaveClicked = () => {
    axios
      .post("http://localhost:5000/chatroom/leave", {
        userId: room.user.userId,
        roomId: room.roomId,
      })
      .then(() => {
        navigate("/");
        setJoined(false);
      });
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
              ></Gate>
            </section>
          )}
        </div>

        <div className='chat__room-container'>
          {joined && (
            <section className='room'>
              <video id='received_video' autoPlay></video>
              <video id='local_video' autoPlay muted></video>
              <header className='room__header'>
                <h1>Room Name: {room.roomName}</h1>

                {room && (
                  <>
                    <div className='room__header--actions'>
                      <h3>
                        Room link: <a href={room.roomLink}>Room</a>
                      </h3>

                      <button
                        className='chat-button'
                        type='submit'
                        onClick={handleLeaveClicked}
                      >
                        Leave
                      </button>
                    </div>
                  </>
                )}
              </header>

              <main className='room__main'>
                <div className='room__main--user-list'>
                  <UsersList
                    user={room.user}
                    roomId={room.roomId}
                    list={room.members}
                  ></UsersList>
                </div>

                <div ref={messageBox} className='room__main--chat-messages'>
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

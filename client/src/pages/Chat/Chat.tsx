import { FC, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Gate, UsersList, MessageForm } from "./components";
import { UserMessages } from "./components/UserMessages";

import "./chat.scss";
import {
  selectJoined,
  selectMessages,
  selectRoomId,
  selectRoomLink,
  selectRoomName,
  selectUser,
} from "./state/chatSelector";
import { leaveRoom } from ".";

export const Chat: FC = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const joined = useSelector(selectJoined);
  const roomName = useSelector(selectRoomName);
  const roomLink = useSelector(selectRoomLink);
  const roomId = useSelector(selectRoomId);
  const user = useSelector(selectUser);
  const messageBox = useRef<HTMLDivElement>();

  useEffect(() => {
    if (messageBox && messageBox.current) {
      messageBox.current.scrollTo(0, messageBox.current.scrollHeight);
    }
  }, [messages]);

  const handleLeaveClicked = () => {
    dispatch(
      leaveRoom({
        userId: user.userId,
        roomId,
      })
    );
  };

  return (
    <>
      <div className='chat'>
        <div className='chat__gate-container'>
          {!joined && (
            <section>
              <Gate></Gate>
            </section>
          )}
        </div>

        <div className='chat__room-container'>
          {joined && (
            <section className='room'>
              <header className='room__header'>
                <h1>Room Name: {roomName}</h1>

                {
                  <>
                    <div className='room__header--actions'>
                      <h3>
                        Room link: <a href={roomLink}>Room</a>
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
                }
              </header>

              <main className='room__main'>
                <div className='room__main--user-list'>
                  <UsersList></UsersList>
                </div>

                <div ref={messageBox} className='room__main--chat-messages'>
                  <UserMessages messages={messages}></UserMessages>
                </div>
              </main>

              <footer className='room__footer'>
                <MessageForm></MessageForm>
              </footer>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

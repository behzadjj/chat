import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Gate, UsersList, MessageForm } from "./components";
import { UserMessages } from "./components/UserMessages";

import "./chat.scss";
import {
  selectCallMode,
  selectJoined,
  selectRoomId,
  selectRoomLink,
  selectRoomName,
  selectUser,
} from "./state/chatSelector";
import { leaveRoom } from ".";
import { Call } from "./components/Call";

export const Chat: FC = () => {
  const dispatch = useDispatch();
  const joined = useSelector(selectJoined);
  const callActivated = useSelector(selectCallMode);
  const roomName = useSelector(selectRoomName);
  const roomLink = useSelector(selectRoomLink);
  const roomId = useSelector(selectRoomId);
  const user = useSelector(selectUser);

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
          {joined && !callActivated && (
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

                <div className='room__main--chat-messages'>
                  <UserMessages></UserMessages>
                </div>
              </main>

              <footer className='room__footer'>
                <MessageForm></MessageForm>
              </footer>
            </section>
          )}

          {joined && callActivated && <Call></Call>}
        </div>
      </div>
    </>
  );
};

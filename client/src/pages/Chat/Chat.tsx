import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Gate, UsersList, MessageForm } from "./components";
import { UserMessages } from "./components/UserMessages";

import "./chat.scss";
import {
  selectCallMode,
  selectJoined,
  selectRingingUser,
  selectRoomId,
  selectRoomLink,
  selectRoomName,
  selectUser,
  selectCallRequestingUser,
} from "./state/chatSelector";
import { leaveRoom, answerCallRequest } from ".";
import { Call } from "./components/Call";

export const Chat: FC = () => {
  const dispatch = useDispatch();
  const joined = useSelector(selectJoined);
  const callActivated = useSelector(selectCallMode);
  const roomName = useSelector(selectRoomName);
  const roomLink = useSelector(selectRoomLink);
  const roomId = useSelector(selectRoomId);
  const user = useSelector(selectUser);
  const ringingUser = useSelector(selectRingingUser);
  const requestCallUser = useSelector(selectCallRequestingUser);

  const handleLeaveClicked = () => {
    dispatch(
      leaveRoom({
        userId: user.userId,
        roomId,
      })
    );
  };

  const handleAcceptCallClicked = (answering: boolean) => {
    dispatch(answerCallRequest(answering));
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

      {requestCallUser && (
        <section className='call-modal'>
          <h1>Video calling to: {requestCallUser.name}</h1>
        </section>
      )}

      {ringingUser && (
        <section className='call-modal'>
          <h1>Incoming call from: {ringingUser.name}</h1>
          <div className='call-modal__action'>
            <button
              className='chat-button'
              onClick={() => {
                handleAcceptCallClicked(true);
              }}
            >
              Accept
            </button>
            <button
              className='chat-button accent'
              onClick={() => {
                handleAcceptCallClicked(false);
              }}
            >
              Decline
            </button>
          </div>
        </section>
      )}
    </>
  );
};

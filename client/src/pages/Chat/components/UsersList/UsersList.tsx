import { FC } from "react";

import { Message } from "@chat/implement";
import { ICallInvitationPayload, MessageType, RoomUsers } from "@chat/models";
import { socketChannel, WebRtc } from "@chat/utils";

import "./userList.scss";

type Props = {
  list: Array<RoomUsers>;
  user: RoomUsers;
  roomId: string;
};

export const UsersList: FC<Props> = ({ list, user, roomId }) => {
  const handleCallClicked = (target: RoomUsers) => {
    console.log(user);
    const connection = WebRtc.Instance.myPeerConnection;
    WebRtc.Instance.myPeerConnection
      .createOffer()
      .then((offer) => {
        return connection.setLocalDescription(offer);
      })
      .then(() => {
        if (socketChannel) {
          const message = new Message<ICallInvitationPayload>(
            user,
            MessageType.CALL_INVITATION,
            [target],
            {
              sdp: connection.localDescription,
              roomId,
            }
          );

          socketChannel.emit("chat-room", Message.serialize(message));
        }
      })
      .catch(() => {
        console.log("not ready to send ");
      });
  };

  return (
    <>
      <section className='users-list'>
        <h5 className='users-list__header'>Users list</h5>

        <main className='users-list__main'>
          {list &&
            list.map((user) => (
              <div className='user-list-item' key={user.userId}>
                <span>name: {user.name}</span>
                &nbsp;
                {user.rule === "moderator" && <span>*</span>}
                <button
                  onClick={() => {
                    handleCallClicked(user);
                  }}
                >
                  call
                </button>
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

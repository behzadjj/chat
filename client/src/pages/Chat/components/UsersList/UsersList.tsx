import { FC } from "react";
import { useSelector } from "react-redux";

import { selectRoomMembers } from "@chat/pages";
import { webRTC } from "@chat/utils/webrtc";
import { selectUser } from "@chat/pages/Chat";

import "./userList.scss";
import { RoomUsers } from "models";

export const UsersList: FC = () => {
  const members = useSelector(selectRoomMembers);
  const user = useSelector(selectUser);

  const handleCallClicked = (target: RoomUsers) => {
    console.log(target);
    webRTC.Instance.start(target, user);
  };

  return (
    <>
      <section className='users-list'>
        <h5 className='users-list__header'>Users list</h5>

        <main className='users-list__main'>
          {members &&
            members.map((member) => (
              <div className='user-list-item' key={member.userId}>
                <span>name: {member.name}</span>
                &nbsp;
                {member.rule === "moderator" && <span>*</span>}
                {member.userId !== user.userId && (
                  <button
                    onClick={() => {
                      handleCallClicked(member);
                    }}
                  >
                    Call
                  </button>
                )}
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

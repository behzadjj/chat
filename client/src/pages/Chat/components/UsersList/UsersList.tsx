import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectRoomMembers, startCall } from "@chat/pages";
import { selectUser } from "@chat/pages/Chat";

import "./userList.scss";
import { RoomUsers } from "models";

export const UsersList: FC = () => {
  const members = useSelector(selectRoomMembers);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleCallClicked = (target: RoomUsers) => {
    console.log(target);
    // webRTC.Instance.start(target, user);
    dispatch(startCall(target));
  };

  return (
    <>
      <section className='users-list'>
        <h5 className='users-list__header'>Users list</h5>

        <main className='users-list__main'>
          {members &&
            members.map((member) => (
              <div className='user-list-item' key={member.userId}>
                <span>{member.name}</span>
                &nbsp;
                {member.rule === "moderator" && <span>*</span>}
                {member.userId !== user.userId && (
                  <button
                    className='chat-link-button'
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

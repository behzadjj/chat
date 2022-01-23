import { FC } from "react";
import { useSelector } from "react-redux";

import { selectRoomMembers } from "@chat/pages";

import "./userList.scss";

export const UsersList: FC = () => {
  const members = useSelector(selectRoomMembers);
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
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

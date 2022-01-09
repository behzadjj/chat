import { RoomUsers } from "models";
import { FC } from "react";

import "./userList.scss";

type Props = {
  list: Array<RoomUsers>;
};

export const UsersList: FC<Props> = ({ list }) => {
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
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

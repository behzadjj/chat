import { RoomUsers } from "models";
import { FC } from "react";

type Props = {
  list: Array<RoomUsers>;
};

export const UsersList: FC<Props> = ({ list }) => {
  return (
    <>
      <section className='users-list'>
        <h5>Users list</h5>

        <main>
          {list &&
            list.map((user) => (
              <div className='user-list-item' key={user.userId}>
                <span>name: {user.name}</span>
                &nbsp;&nbsp;&nbsp;
                <span>rule: {user.rule}</span>
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

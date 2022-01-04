import { FC } from "react";

type Props = {
  messages: Array<string>;
};

export const UserMessages: FC<Props> = ({ messages }) => {
  return (
    <>
      <div className='user-messages'>
        {messages &&
          messages.map((message) => (
            <div key={message + Math.random()}>{message}</div>
          ))}
      </div>
    </>
  );
};

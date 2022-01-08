import { IChatMessage } from "@chat/models";
import { FC } from "react";

type Props = {
  messages: Array<IChatMessage>;
};

export const UserMessages: FC<Props> = ({ messages }) => {
  console.log(messages);
  return (
    <>
      <div className='user-messages'>
        {messages &&
          messages.map((message) => (
            <div key={message.id}>
              <span>{message.from}:&nbsp;</span>
              <span>{message.payload.text}&nbsp; ****** &nbsp;</span>
              <span>{message.sendDate}</span>
            </div>
          ))}
      </div>
    </>
  );
};

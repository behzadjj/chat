import { FC } from "react";

export type ChatMessage = {
  roomId: string;
  sendingDate: Date;
  text: string;
  userId?: string;
  userName?: string;
  messageId?: string;
};

type Props = {
  messages: Array<ChatMessage>;
};

export const UserMessages: FC<Props> = ({ messages }) => {
  console.log(messages);
  return (
    <>
      <div className='user-messages'>
        {messages &&
          messages.map((message) => (
            <div key={message.messageId}>
              <span>{message.userName}:&nbsp;</span>
              <span>{message.text}&nbsp; ****** &nbsp;</span>
              <span>{message.sendingDate}</span>
            </div>
          ))}
      </div>
    </>
  );
};

import { FC } from "react";
import { format } from "date-fns";

import { IChatMessage } from "@chat/models";

import "./userMessages.scss";

export type ChatMessage = IChatMessage & { fromName: string };

type Props = {
  messages: Array<IChatMessage>;
};

export const UserMessages: FC<Props> = ({ messages }) => {
  return (
    <>
      <section className='user-messages'>
        <h5 className='user-messages__header'>Messages</h5>

        <main className='user-messages__main'>
          {messages &&
            messages.map((message) => (
              <div className='user-message' key={message.id}>
                <span>
                  ({format(new Date(message.sendDate), "H:mm:ss")})&nbsp;
                </span>
                <span>{message.from.name}:&nbsp;</span>
                <span>{message.payload.text}</span>
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

import { FC } from "react";

import { IChatMessage } from "@chat/models";

export type ChatMessage = IChatMessage & { fromName: string };

type Props = {
  messages: Array<IChatMessage>;
};

export const UserMessages: FC<Props> = ({ messages }) => {
  return (
    <>
      <section className='user-messages'>
        <h5>Messages</h5>

        <main>
          {messages &&
            messages.map((message) => (
              <div key={message.id}>
                <span>{message.from.name}:&nbsp;</span>
                <span>{message.payload.text}&nbsp; ****** &nbsp;</span>
                <span>{message.sendDate}</span>
              </div>
            ))}
        </main>
      </section>
    </>
  );
};

import { FC, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

import { IChatMessage } from "@chat/models";
import { selectMessages } from "@chat/pages";

import "./userMessages.scss";

export type ChatMessage = IChatMessage & { fromName: string };

export const UserMessages: FC = () => {
  const messages = useSelector(selectMessages);
  const messageBox = useRef<HTMLDivElement>();

  useEffect(() => {
    if (messageBox && messageBox.current) {
      messageBox.current.scrollTo(0, messageBox.current.scrollHeight);
    }
  }, [messages]);

  return (
    <>
      <section className='user-messages'>
        <h5 className='user-messages__header'>Messages</h5>

        <main ref={messageBox} className='user-messages__main'>
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

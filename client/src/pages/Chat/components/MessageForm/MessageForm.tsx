import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import { TextField } from "@chat/components/TextField/TextField";
import { IChatMessagePayload, MessageType } from "@chat/models";
import { Message } from "@chat/implement";
import { socketChannel } from "@chat/utils";
import { selectRoomId, selectUser } from "@chat/pages";

import "./messageForm.scss";

type FormValues = {
  message: string;
};

const MessageSchema = Yup.object().shape({
  message: Yup.string().min(0, "short-input").max(50, "long-input"),
});

export const MessageForm: FC = () => {
  const user = useSelector(selectUser);
  const roomId = useSelector(selectRoomId);
  const handleSendSubmitted = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    if (values.message) {
      if (socketChannel) {
        const message = new Message<IChatMessagePayload>(
          user,
          MessageType.CHAT_MESSAGE,
          "all",
          {
            text: values.message,
            chatMessageType: "TEXT",
            roomId,
          }
        );

        socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
      }
      values.message = "";
    }

    setSubmitting(false);
  };

  return (
    <>
      <section className='message'>
        {/* <h5>Message form</h5> */}

        <Formik
          initialValues={{ message: "" }}
          validationSchema={MessageSchema}
          onSubmit={handleSendSubmitted}
        >
          {({ values, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <div className='message-form'>
                <div className='message-form__main'>
                  <TextField
                    label='Message'
                    type='text'
                    id='message'
                    name='message'
                    value={values.message}
                  />
                </div>
                <footer className='message-form__footer'>
                  <button
                    className='chat-button'
                    type='submit'
                    disabled={isSubmitting}
                  >
                    Send
                  </button>
                </footer>
              </div>
            </form>
          )}
        </Formik>
      </section>
    </>
  );
};

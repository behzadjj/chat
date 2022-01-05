import { FC } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextField } from "@chat/components/TextField";

type FormValues = {
  message: string;
};

const MessageSchema = Yup.object().shape({
  message: Yup.string()
    .min(2, "short-input")
    .max(50, "long-input")
    .required("required-input"),
});

type Props = {
  onMessage: (message: string) => void;
};

export const MessageForm: FC<Props> = ({ onMessage }) => {
  const handleSendSubmitted = (values: FormValues) => {
    if (values.message) {
      onMessage(values.message);
      values.message = "";
    }
  };

  return (
    <>
      <div className='message-form'>
        <Formik
          initialValues={{ message: "" }}
          validationSchema={MessageSchema}
          onSubmit={handleSendSubmitted}
        >
          {({ values, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <div className='chat-form'>
                <header>
                  <h1>Message</h1>
                </header>
                <main>
                  <TextField
                    label='Message'
                    type='text'
                    id='message'
                    name='message'
                    value={values.message}
                  />
                </main>

                <footer>
                  <button type='submit' disabled={isSubmitting}>
                    Submit
                  </button>
                </footer>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </>
  );
};

import { FC } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

type FormValues = {
  message: string;
};

const MessageSchema = Yup.object().shape({
  username: Yup.string()
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
          {({
            errors,
            touched,
            values,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit}>
              <div className='chat-form'>
                <header>
                  <h1>Message</h1>
                </header>
                <main>
                  <label htmlFor='message'>Message</label>
                  <input
                    id='message'
                    type='text'
                    name='message'
                    value={values.message}
                    onChange={handleChange}
                  />
                  <span className='input-error'>
                    {touched && errors && errors.message ? (
                      <div className='error'>{errors.message}</div>
                    ) : null}
                  </span>
                </main>

                <footer>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    onClick={() => {
                      handleSendSubmitted(values);
                    }}
                  >
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

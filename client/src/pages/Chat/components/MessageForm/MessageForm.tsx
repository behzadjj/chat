import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
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
  const handleSendSubmitted = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    if (values.message) {
      onMessage(values.message);
      values.message = "";
    }

    setSubmitting(false);
  };

  return (
    <>
      <section className='message-form'>
        <h5>Message form</h5>

        <main>
          <Formik
            initialValues={{ message: "" }}
            validationSchema={MessageSchema}
            onSubmit={handleSendSubmitted}
          >
            {({ values, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit}>
                <TextField
                  label='Message'
                  type='text'
                  id='message'
                  name='message'
                  value={values.message}
                />

                <footer>
                  <button type='submit' disabled={isSubmitting}>
                    Submit
                  </button>
                </footer>
              </form>
            )}
          </Formik>
        </main>
      </section>
    </>
  );
};

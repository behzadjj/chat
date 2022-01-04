import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

type FormValues = {
  username: string;
};

const joinSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "short-input")
    .max(50, "long-input")
    .required("required-input"),
});

type Props = {
  onJoin: (username: string) => void;
};

export const Gate: FC<Props> = ({ onJoin }) => {
  const handleJoinSubmitted = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    onJoin(values.username);
    setSubmitting(false);
  };

  return (
    <>
      <div className='gate'>
        <Formik
          initialValues={{ username: "" }}
          validationSchema={joinSchema}
          onSubmit={handleJoinSubmitted}
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
              <div className='username-form'>
                <header>
                  <h1>Join</h1>
                </header>

                <main>
                  <label htmlFor='username'>Username</label>
                  <input
                    id='username'
                    type='text'
                    name='username'
                    value={values.username}
                    onChange={handleChange}
                  />
                  <span className='input-error'>
                    {touched && errors && errors.username ? (
                      <div className='error'>{errors.username}</div>
                    ) : null}
                  </span>
                </main>

                <footer>
                  <button type='submit' disabled={isSubmitting}>
                    Join
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

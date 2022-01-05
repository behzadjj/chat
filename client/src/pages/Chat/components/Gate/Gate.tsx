import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

type CreateFormValues = {
  username: string;
  roomName: string;
};

type JoinFormValues = {
  username: string;
  roomId: string;
};

export enum GateModes {
  CREATE = 0,
  JOIN = 1,
}

const createSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "short-input")
    .max(50, "long-input")
    .required("required-input"),
  roomName: Yup.string()
    .min(2, "short-input")
    .max(50, "long-input")
    .required("required-input"),
});

const joinSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "short-input")
    .max(50, "long-input")
    .required("required-input"),
  roomId0: Yup.string()
    .min(2, "short-input")
    .max(50, "long-input")
    .required("required-input"),
});

type Props = {
  onCreate?: (username: string, roomName: string) => void;
  onJoin?: (username: string, roomId: string) => void;
  gateMode: GateModes;
};

export const Gate: FC<Props> = ({
  onCreate,
  gateMode = GateModes.CREATE,
  onJoin,
}) => {
  const handleCreatSubmitted = (
    values: CreateFormValues,
    { setSubmitting }: FormikHelpers<CreateFormValues>
  ) => {
    if (onCreate) onCreate(values.username, values.roomName);
    setSubmitting(false);
  };

  const handleJoinSubmitted = (values: JoinFormValues) => {
    console.log("awdawd");
    if (onJoin) onJoin(values.username, values.roomId);
  };

  return (
    <>
      <div className='gate'>
        {gateMode === GateModes.CREATE && (
          <Formik
            initialValues={{ username: "", roomName: "" }}
            validationSchema={createSchema}
            onSubmit={handleCreatSubmitted}
          >
            {({
              errors,
              touched,
              values,
              handleChange,
              handleSubmit,
              isSubmitting,
              handleBlur,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className='username-form'>
                  <header>
                    <h1>Create</h1>
                  </header>

                  <main>
                    <div className='input-group'>
                      <label htmlFor='username'>Username</label>
                      <input
                        id='username'
                        type='text'
                        name='username'
                        value={values.username}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />
                      <span className='input-error'>
                        {touched.username && errors.username && errors.username}
                      </span>
                    </div>
                    <div className='input-group'>
                      <label htmlFor='roomName'>Room Name</label>
                      <input
                        id='roomName'
                        type='text'
                        name='roomName'
                        value={values.roomName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span className='input-error'>
                        {touched.roomName && errors.roomName && errors.roomName}
                      </span>
                    </div>
                  </main>

                  <footer>
                    <button type='submit' disabled={isSubmitting}>
                      Create
                    </button>
                  </footer>
                </div>
              </form>
            )}
          </Formik>
        )}
        {gateMode === GateModes.JOIN && (
          <Formik
            initialValues={{ username: "", roomId: "" }}
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
              handleBlur,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className='username-form'>
                  <header>
                    <h1>Join</h1>
                  </header>

                  <main>
                    <div className='input-group'>
                      <label htmlFor='username'>Username</label>
                      <input
                        id='username'
                        type='text'
                        name='username'
                        value={values.username}
                        onBlur={handleBlur}
                        onChange={handleChange}
                      />
                      <span className='input-error'>
                        {touched.username && errors.username && errors.username}
                      </span>
                    </div>
                    <div className='input-group'>
                      <label htmlFor='roomId'>Room Name</label>
                      <input
                        id='roomId'
                        type='text'
                        name='roomId'
                        value={values.roomId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span className='input-error'>
                        {touched.roomId && errors.roomId && errors.roomId}
                      </span>
                    </div>
                  </main>

                  <footer>
                    <button
                      onClick={() => {
                        handleJoinSubmitted(values);
                      }}
                      type='submit'
                      disabled={isSubmitting}
                    >
                      Join
                    </button>
                  </footer>
                </div>
              </form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

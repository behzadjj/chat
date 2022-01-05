import { FC } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { TextField } from "@chat/components/TextField";

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

const regularValidation = Yup.string()
  .min(2, "short-input")
  .max(50, "long-input")
  .required("required-input");

const createSchema = Yup.object().shape({
  username: regularValidation,
  roomName: regularValidation,
});

const joinSchema = Yup.object().shape({
  username: regularValidation,
  roomId: regularValidation,
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

  const handleJoinSubmitted = (
    values: JoinFormValues,
    { setSubmitting }: FormikHelpers<JoinFormValues>
  ) => {
    if (onJoin) onJoin(values.username, values.roomId);
    setSubmitting(false);
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
            {({ values, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit}>
                <div className='username-form'>
                  <header>
                    <h1>Create</h1>
                  </header>

                  <main>
                    <TextField
                      label='Username'
                      type='text'
                      id='username'
                      name='username'
                      value={values.username}
                    />

                    <TextField
                      label='Room Name'
                      type='text'
                      id='roomName'
                      name='roomName'
                      value={values.roomName}
                    />
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
            {({ values, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit}>
                <div className='username-form'>
                  <header>
                    <h1>Join</h1>
                  </header>

                  <main>
                    <TextField
                      label='Room Name'
                      type='text'
                      id='username'
                      name='username'
                      value={values.username}
                    />

                    <TextField
                      label='Room Id'
                      type='text'
                      id='roomId'
                      name='roomId'
                      value={values.roomId}
                    />
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
        )}
      </div>
    </>
  );
};

import { FC, useEffect, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import { useParams } from "react-router-dom";
import * as Yup from "yup";

import { TextField } from "@chat/components/TextField/TextField";

import "./gate.scss";
import { useDispatch } from "react-redux";
import { createRoom, joinRoom } from "@chat/pages";

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
};

export const Gate: FC<Props> = () => {
  const [gateMode, setGateMode] = useState<GateModes>();
  const { roomId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (roomId) {
      setGateMode(GateModes.JOIN);
    }
  }, [roomId]);

  const handleCreatSubmitted = (
    values: CreateFormValues,
    { setSubmitting }: FormikHelpers<CreateFormValues>
  ) => {
    // if (onCreate) onCreate(values.username, values.roomName);
    dispatch(createRoom(values));
    setSubmitting(false);
  };

  const handleJoinSubmitted = (
    values: JoinFormValues,
    { setSubmitting }: FormikHelpers<JoinFormValues>
  ) => {
    // if (onJoin) onJoin(values.username, values.roomId);
    dispatch(joinRoom(values));
    setSubmitting(false);
  };

  const handleJoinModeClicked = () => setGateMode(GateModes.JOIN);

  const handleCreateModeClicked = () => setGateMode(GateModes.CREATE);

  return (
    <>
      <section className='gate'>
        <header className='gate__header'>
          <h1>Chat Room Gate</h1>

          {gateMode !== undefined && (
            <button
              className='chat-button'
              onClick={() => {
                setGateMode(undefined);
              }}
            >
              Back
            </button>
          )}
        </header>

        <main className='gate__main'>
          {gateMode === undefined && (
            <>
              <div className='gate__main--routes-container'>
                <h3 className='gate__main--routes-container__header'>
                  Chat with anyone anywhere in the world
                </h3>
                <main className='gate__main--routes-container__main'>
                  <a
                    href='/#'
                    className='route-anchor'
                    onClick={handleJoinModeClicked}
                  >
                    Join Room
                  </a>

                  <a
                    href='/#'
                    className='route-anchor'
                    onClick={handleCreateModeClicked}
                  >
                    Create Room
                  </a>
                </main>
              </div>
            </>
          )}
          {gateMode === GateModes.CREATE && (
            <div className='gate__main--form-container'>
              <Formik
                initialValues={{ username: "", roomName: "" }}
                validationSchema={createSchema}
                onSubmit={handleCreatSubmitted}
              >
                {({ values, handleSubmit, isSubmitting }) => (
                  <form onSubmit={handleSubmit}>
                    <article className='chat-form'>
                      <h3 className='chat-form__header'>Create</h3>
                      <main className='chat-form__main'>
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

                      <footer className='chat-form__footer'>
                        <button
                          className='chat-button'
                          type='submit'
                          disabled={isSubmitting}
                        >
                          Create
                        </button>
                      </footer>
                    </article>
                  </form>
                )}
              </Formik>
            </div>
          )}
          {gateMode === GateModes.JOIN && (
            <div className='gate__main--form-container'>
              <Formik
                initialValues={{ username: "", roomId }}
                validationSchema={joinSchema}
                onSubmit={handleJoinSubmitted}
              >
                {({ values, handleSubmit, isSubmitting }) => (
                  <form onSubmit={handleSubmit}>
                    <article className='chat-form'>
                      <h3 className='chat-form__header'>Join</h3>

                      <main className='chat-form__main'>
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
                          disabled={roomId !== undefined}
                          value={values.roomId}
                        />
                      </main>

                      <footer className='chat-form__footer'>
                        <button
                          className='chat-button'
                          type='submit'
                          disabled={isSubmitting}
                        >
                          Join
                        </button>
                      </footer>
                    </article>
                  </form>
                )}
              </Formik>
            </div>
          )}
        </main>
      </section>
    </>
  );
};

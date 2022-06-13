import { FC, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectLocalStreamId,
  selectRemoteStreamId,
  setCallActivated,
} from "@chat/pages";
import { streamStore } from "@chat/utils/stream-store";
import { endCall } from "@chat/pages/Chat";
import { selectStreamTarget } from "@chat/pages/Chat/state";

import "./call.scss";

export const Call: FC = () => {
  const dispatch = useDispatch();
  const localStreamId = useSelector(selectLocalStreamId);
  const remoteStreamId = useSelector(selectRemoteStreamId);
  const streamTarget = useSelector(selectStreamTarget);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleEndCallClicked = () => {
    dispatch(endCall());
  };

  useEffect(() => {
    if (remoteStreamId) {
      const stream = streamStore.get(remoteStreamId);
      if (stream) {
        remoteVideoRef.current.srcObject = stream;
      }
    }
  }, [remoteStreamId]);

  useEffect(() => {
    if (localStreamId) {
      const stream = streamStore.get(localStreamId);
      if (stream) {
        localVideoRef.current.srcObject = stream;
      }
    } else if (
      localVideoRef &&
      localVideoRef.current &&
      localVideoRef.current.srcObject
    ) {
      localVideoRef.current.pause();
      (localVideoRef.current.srcObject as any)
        .getTracks()
        .forEach((track: any) => {
          track.stop();
        });

      dispatch(setCallActivated(false));
    }
  }, [localStreamId, dispatch]);

  return (
    <section className='call'>
      <section className='call__local-stream'>
        <header>My Camera</header>
        <video width='100%' muted autoPlay ref={localVideoRef}></video>
      </section>

      <section className='call__remote-stream'>
        <header>{streamTarget && streamTarget.name}</header>
        <video width='100%' autoPlay ref={remoteVideoRef}></video>
      </section>

      <button
        className='chat-button accent'
        type='submit'
        onClick={handleEndCallClicked}
      >
        End Call
      </button>
    </section>
  );
};

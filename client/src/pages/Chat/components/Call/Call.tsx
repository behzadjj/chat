import { FC, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { selectLocalStreamId, selectRemoteStreamId } from "@chat/pages";
import { streamStore } from "@chat/utils/stream-store";

import "./call.scss";

export const Call: FC = () => {
  const localStreamId = useSelector(selectLocalStreamId);
  const remoteStreamId = useSelector(selectRemoteStreamId);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const stream = streamStore.get(remoteStreamId);
    if (stream) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, [remoteStreamId]);

  useEffect(() => {
    const stream = streamStore.get(localStreamId);
    if (stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [localStreamId]);

  return (
    <section className='call'>
      <section className='call__local-stream'>
        <video width={450} muted autoPlay ref={localVideoRef}></video>
      </section>

      <section className='call__remote-stream'>
        <video width={450} autoPlay ref={remoteVideoRef}></video>
      </section>

      <button className='chat-button accent' type='submit'>
        End Call
      </button>
    </section>
  );
};

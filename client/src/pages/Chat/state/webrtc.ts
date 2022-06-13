import { Message } from "@chat/implement";
import {
  ICallMessage,
  ICallMessagePayload,
  MessageType,
  RoomUsers,
} from "@chat/models";
import { buffers, EventChannel, eventChannel } from "redux-saga";
import { call, fork, put, select, take } from "redux-saga/effects";
import { socketChannel } from "@chat/utils";
import { streamStore } from "@chat/utils/stream-store";
import {
  selectUser,
  setCallActivated,
  setLocalStreamId,
  setRemoteStreamId,
  setStreamTarget,
} from ".";
import { PayloadAction } from "@reduxjs/toolkit";

type channelEvent = {
  type: callEventType;
  payload: RTCPeerConnectionIceEvent | Event | RTCTrackEvent;
};
const mediaConstraints = {
  audio: true, // We want an audio track
  video: true,
};

export enum callEventType {
  ICE_CANDIDATE,
  CONNECTION_STATE,
  ICE_GATHERING,
  SIGNALING_STATE,
  NEGOTIATION,
  TRACK,
}

export let myPeerConnection: RTCPeerConnection;

let target: RoomUsers;
let me: RoomUsers;
let webcamStream: MediaStream;
export let transceiver: (track: any) => RTCRtpTransceiver;

export function* handleStartCall({ payload }: PayloadAction<RoomUsers>) {
  target = payload;
  me = yield select(selectUser);
  // Call createPeerConnection() to create the RTCPeerConnection.
  // When this returns, myPeerConnection is our RTCPeerConnection
  // and webcamStream is a stream coming from the camera. They are
  // not linked together in any way yet.

  yield call(log, "Setting up connection to invite user: " + target.name);
  yield fork(createPeerConnection);

  try {
    webcamStream = yield navigator.mediaDevices.getDisplayMedia(
      mediaConstraints
    );

    const streamId = webcamStream.id;
    streamStore.set(streamId, webcamStream);
    yield put(setLocalStreamId(streamId));
  } catch (err) {
    yield fork(handleGetUserMediaError, err);
    return;
  }

  try {
    webcamStream.getTracks().forEach(
      (transceiver = (track) =>
        myPeerConnection.addTransceiver(track, {
          streams: [webcamStream],
        }))
    );
  } catch (err) {
    yield fork(handleGetUserMediaError, err);
  }
}

export function* createPeerConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  yield put(setCallActivated(true));

  const callChannel: EventChannel<{
    type: callEventType;
    payload: RTCPeerConnectionIceEvent | Event | RTCTrackEvent;
  }> = yield call(callEventChannel, myPeerConnection);

  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload: channelEvent = yield take(callChannel);
      yield fork(eventHandler, payload);
    } catch (err) {
      console.error("call error:", err);
    }
  }
}

export function* handleMessages(message: ICallMessage) {
  const msg = message.payload;
  me = yield select(selectUser);
  if (me && message.from.userId === me.userId) {
    return;
  }
  switch (msg.type) {
    // Signaling messages: these messages are used to trade WebRTC
    // signaling information during negotiations leading up to a video
    // call.

    case "video-offer": {
      // Invitation and offer to chat
      yield call(handleVideoOfferMsg, msg, message.from);
      break;
    }

    case "video-answer": // Callee has answered our offer
      yield call(handleVideoAnswerMsg, msg);
      break;

    case "new-ice-candidate": // A new ICE candidate has been received
      yield call(handleNewICECandidateMsg, msg);
      break;

    case "hang-up": // The other peer has hung up the call
      yield call(handleHangUpMsg);
      break;

    // Unknown message; output to console for debugging.

    default:
      log_error("Unknown message received:");
      log_error(msg.type);
  }
}

const callEventChannel = (myPeerConnection: RTCPeerConnection) => {
  return eventChannel((emit) => {
    const callback =
      (type: callEventType) =>
      (evt: RTCPeerConnectionIceEvent | Event | RTCTrackEvent) =>
        emit({ type, payload: evt });

    myPeerConnection.onicecandidate = callback(callEventType.ICE_CANDIDATE);

    myPeerConnection.oniceconnectionstatechange = callback(
      callEventType.CONNECTION_STATE
    );

    myPeerConnection.onicegatheringstatechange = callback(
      callEventType.ICE_GATHERING
    );

    myPeerConnection.onsignalingstatechange = callback(
      callEventType.SIGNALING_STATE
    );

    myPeerConnection.onnegotiationneeded = callback(callEventType.NEGOTIATION);

    myPeerConnection.ontrack = callback(callEventType.TRACK);

    return () => {
      myPeerConnection.onicecandidate = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onnegotiationneeded = null;
      myPeerConnection.ontrack = null;
    };
  }, buffers.sliding(20));
};

function* eventHandler(evt: channelEvent) {
  switch (evt.type) {
    case callEventType.CONNECTION_STATE: {
      yield call(handleICEConnectionStateChangeEvent);
      break;
    }
    case callEventType.ICE_CANDIDATE: {
      yield call(handleICECandidateEvent, evt.payload);
      break;
    }
    case callEventType.ICE_GATHERING: {
      yield call(handleICEGatheringStateChangeEvent);
      break;
    }
    case callEventType.NEGOTIATION: {
      yield call(handleNegotiationNeededEvent);
      break;
    }
    case callEventType.SIGNALING_STATE: {
      yield call(handleSignalingStateChangeEvent);
      break;
    }
    case callEventType.TRACK: {
      yield call(handleTrackEvent, evt.payload);
      break;
    }
  }
}

function* handleNegotiationNeededEvent() {
  try {
    log("---> Creating offer");
    const offer: RTCSessionDescriptionInit =
      yield myPeerConnection.createOffer();

    // If the connection hasn't yet achieved the "stable" state,
    // return to the caller. Another negotiationneeded event
    // will be fired when the state stabilizes.

    if (myPeerConnection.signalingState !== "stable") {
      log("-- The connection isn't stable yet; postponing...");
      return;
    }

    // Establish the offer as the local peer's current
    // description.

    log("---> Setting local description to the offer");
    yield myPeerConnection.setLocalDescription(offer);

    // Send the offer to the remote peer.

    log("---> Sending the offer to the remote peer");

    me = yield select(selectUser);

    const message = new Message<ICallMessagePayload>(
      me,
      MessageType.CALL_MESSAGE,
      "all",
      {
        name: "me",
        target: "you",
        type: "video-offer",
        sdp: myPeerConnection.localDescription,
      }
    );

    socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
  } catch (err) {
    log(
      "*** The following error occurred while handling the negotiationneeded event:"
    );
    reportError(err);
  }
}

function* handleICEConnectionStateChangeEvent() {
  yield call(
    log,
    "*** ICE connection state changed to " + myPeerConnection.iceConnectionState
  );

  switch (myPeerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      yield call(closeVideoCall);
      break;
  }
}

function* handleICECandidateEvent(event: any) {
  if (event.candidate) {
    yield fork(log, "*** Outgoing ICE candidate: " + event.candidate.candidate);
    const message = new Message<ICallMessagePayload>(
      me,
      MessageType.CALL_MESSAGE,
      "all",
      {
        type: "new-ice-candidate",
        target: "yadola",
        candidate: event.candidate,
      }
    );

    socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
  }
}

function* handleICEGatheringStateChangeEvent() {
  yield fork(
    log,
    "*** ICE gathering state changed to: " + myPeerConnection.iceGatheringState
  );
}

function* handleSignalingStateChangeEvent() {
  yield fork(
    log,
    "*** WebRTC signaling state changed to: " + myPeerConnection.signalingState
  );
  switch (myPeerConnection.signalingState) {
    case "closed":
      yield fork(closeVideoCall);
      break;
  }
}

function* handleTrackEvent(event: any) {
  const streamId = event.streams[0].id;
  streamStore.set(streamId, event.streams[0]);
  yield put(setRemoteStreamId(streamId));
}

function* handleVideoAnswerMsg(msg: any) {
  yield fork(log, "*** Call recipient has accepted our call");

  // Configure the remote description, which is the SDP payload
  // in our "video-answer" message.

  var desc = new RTCSessionDescription(msg.sdp);
  yield myPeerConnection.setRemoteDescription(desc).catch(reportError);
}

function* handleHangUpMsg() {
  yield fork(log, "*** Received hang up notification from other peer");

  yield call(closeVideoCall);
}

function* handleNewICECandidateMsg(msg: any) {
  var candidate = new RTCIceCandidate(msg.candidate);

  yield fork(
    log,
    "*** Adding received ICE candidate: " + JSON.stringify(candidate)
  );

  try {
    yield myPeerConnection.addIceCandidate(candidate);
  } catch (err) {
    reportError(err);
  }
}

function* handleVideoOfferMsg(msg: any, user: RoomUsers) {
  target = user;
  yield put(setStreamTarget(user.userId));

  // If we're not already connected, create an RTCPeerConnection
  // to be linked to the caller.

  yield fork(log, "Received video chat offer from " + target.name);
  if (!myPeerConnection) {
    yield fork(createPeerConnection);
  }

  // We need to set the remote description to the received SDP offer
  // so that our local WebRTC layer knows how to talk to the caller.

  var desc = new RTCSessionDescription(msg.sdp);

  // If the connection isn't stable yet, wait for it...

  if (myPeerConnection.signalingState !== "stable") {
    yield fork(
      log,
      "  - But the signaling state isn't stable, so triggering rollback"
    );

    // Set the local and remove descriptions for rollback; don't proceed
    // until both return.
    yield Promise.all([
      myPeerConnection.setLocalDescription({ type: "rollback" }),
      myPeerConnection.setRemoteDescription(desc),
    ]);
    return;
  } else {
    log("  - Setting remote description");
    yield myPeerConnection.setRemoteDescription(desc);
  }

  // Get the webcam stream if we don't already have it

  if (!webcamStream) {
    try {
      // this.webcamStream = await navigator.mediaDevices.getUserMedia(
      //   mediaConstraints
      // );

      webcamStream = yield navigator.mediaDevices.getDisplayMedia(
        mediaConstraints
      );

      const streamId = webcamStream.id;
      streamStore.set(streamId, webcamStream);
      yield put(setLocalStreamId(streamId));
    } catch (err) {
      yield fork(handleGetUserMediaError, err);
      return;
    }

    // Add the camera stream to the RTCPeerConnection

    try {
      webcamStream.getTracks().forEach(
        (transceiver = (track: any) =>
          myPeerConnection.addTransceiver(track, {
            streams: [webcamStream],
          }))
      );
    } catch (err) {
      yield fork(handleGetUserMediaError, err);
    }
  }

  log("---> Creating and sending answer to caller");

  const answer: RTCSessionDescriptionInit =
    yield myPeerConnection.createAnswer();

  yield myPeerConnection.setLocalDescription(answer);

  const message = new Message<ICallMessagePayload>(
    me,
    MessageType.CALL_MESSAGE,
    "all",
    {
      name: "",
      target: "",
      type: "video-answer",
      sdp: myPeerConnection.localDescription,
    }
  );

  socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
}

function* handleGetUserMediaError(event: any) {
  yield call(log_error, event);
  switch (event.name) {
    case "NotFoundError":
      alert(
        "Unable to open your call because no camera and/or microphone" +
          "were found."
      );
      break;
    case "SecurityError":
    case "PermissionDeniedError":
      // Do nothing; this is the same as the user canceling the call.
      break;
    default:
      alert("Error opening your camera and/or microphone: " + event.message);
      break;
  }

  // Make sure we shut down our end of the RTCPeerConnection so we're
  // ready to try again.

  yield call(closeVideoCall);
}

function* closeVideoCall() {
  log("Closing the call");

  // Close the RTCPeerConnection

  if (myPeerConnection) {
    log("--> Closing the peer connection");

    // Disconnect all our event listeners; we don't want stray events
    // to interfere with the hangup while it's ongoing.

    myPeerConnection.ontrack = null;
    myPeerConnection.onicecandidate = null;
    myPeerConnection.oniceconnectionstatechange = null;
    myPeerConnection.onsignalingstatechange = null;
    myPeerConnection.onicegatheringstatechange = null;
    myPeerConnection.onnegotiationneeded = null;

    // Stop all transceivers on the connection

    myPeerConnection.getTransceivers().forEach((transceiver) => {
      transceiver.stop();
    });

    // Stop the webcam preview as well by pausing the <video>
    // element, then stopping each of the getUserMedia() tracks
    // on it.

    // Close the peer connection

    myPeerConnection.close();
    myPeerConnection = null;
    yield put(setLocalStreamId(null));
    yield put(setRemoteStreamId(null));
    //   this.webcamStream = null
  }
}

const log = (text: string) => {
  console.log(text);
};

const reportError = (errMessage: any) => {
  log(`Error ${errMessage.name}: ${errMessage.message}`);
};

const log_error = (text: string) => {
  var time = new Date();

  console.trace("[" + time.toLocaleTimeString() + "] " + text);
};

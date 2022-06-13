export {};

// import { Message } from "@chat/implement";
// import {
//   ICallMessage,
//   ICallMessagePayload,
//   MessageType,
//   RoomUsers,
// } from "@chat/models";
// import { Dispatch } from "@chat/redux";
// import {
//   setCallActivated,
//   setLocalStreamId,
//   setRemoteStreamId,
// } from "@chat/pages";
// import { socketChannel } from "./socket";
// import { streamStore } from "./stream-store";

// const mediaConstraints = {
//   audio: true, // We want an audio track
//   video: true,
// };

// export class webRTC {
//   private static instance: webRTC;

//   public static get Instance() {
//     if (!webRTC.instance) webRTC.instance = new webRTC();

//     return webRTC.instance;
//   }

//   me: RoomUsers;
//   target: RoomUsers;
//   myPeerConnection: RTCPeerConnection;
//   webcamStream: MediaStream;
//   transceiver: (track: MediaStreamTrack) => RTCRtpTransceiver;

//   start = async (user: RoomUsers, me: RoomUsers) => {
//     this.target = user;
//     this.me = me;
//     // Call createPeerConnection() to create the RTCPeerConnection.
//     // When this returns, myPeerConnection is our RTCPeerConnection
//     // and webcamStream is a stream coming from the camera. They are
//     // not linked together in any way yet.

//     this.log("Setting up connection to invite user: " + this.target.name);
//     this.createPeerConnection();

//     try {
//       this.webcamStream = await navigator.mediaDevices.getDisplayMedia(
//         mediaConstraints
//       );

//       const streamId = this.webcamStream.id;
//       streamStore.set(streamId, this.webcamStream);
//       Dispatch(setLocalStreamId(streamId));
//     } catch (err) {
//       this.handleGetUserMediaError(err);
//       return;
//     }

//     try {
//       this.webcamStream.getTracks().forEach(
//         (this.transceiver = (track) =>
//           this.myPeerConnection.addTransceiver(track, {
//             streams: [this.webcamStream],
//           }))
//       );
//     } catch (err) {
//       this.handleGetUserMediaError(err);
//     }
//   };

//   createPeerConnection() {
//     Dispatch(setCallActivated(true));
//     // Create an RTCPeerConnection which knows to use our chosen
//     // STUN server.
//     this.log("start connecting");

//     this.myPeerConnection = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: "stun:stun.l.google.com:19302",
//         },
//       ],
//     });

//     // Set up event handlers for the ICE negotiation process.
//     this.myPeerConnection.onicecandidate = this.handleICECandidateEvent;
//     this.myPeerConnection.oniceconnectionstatechange =
//       this.handleICEConnectionStateChangeEvent;
//     this.myPeerConnection.onicegatheringstatechange =
//       this.handleICEGatheringStateChangeEvent;
//     this.myPeerConnection.onsignalingstatechange =
//       this.handleSignalingStateChangeEvent;
//     this.myPeerConnection.onnegotiationneeded =
//       this.handleNegotiationNeededEvent;
//     this.myPeerConnection.ontrack = this.handleTrackEvent;
//   }

//   handleMessages(message: ICallMessage) {
//     const msg = message.payload;
//     if (this.me && message.from.userId === this.me.userId) {
//       return;
//     }
//     switch (msg.type) {
//       // Signaling messages: these messages are used to trade WebRTC
//       // signaling information during negotiations leading up to a video
//       // call.

//       case "video-offer": {
//         // Invitation and offer to chat
//         this.handleVideoOfferMsg(msg, message.from);
//         break;
//       }

//       case "video-answer": // Callee has answered our offer
//         this.handleVideoAnswerMsg(msg);
//         break;

//       case "new-ice-candidate": // A new ICE candidate has been received
//         this.handleNewICECandidateMsg(msg);
//         break;

//       case "hang-up": // The other peer has hung up the call
//         this.handleHangUpMsg();
//         break;

//       // Unknown message; output to console for debugging.

//       default:
//         this.log_error("Unknown message received:");
//         this.log_error(msg.type);
//     }
//   }

//   private handleVideoOfferMsg = async (msg: any, user: RoomUsers) => {
//     this.target = user;

//     // If we're not already connected, create an RTCPeerConnection
//     // to be linked to the caller.

//     this.log("Received video chat offer from " + this.target.name);
//     if (!this.myPeerConnection) {
//       this.createPeerConnection();
//     }

//     // We need to set the remote description to the received SDP offer
//     // so that our local WebRTC layer knows how to talk to the caller.

//     var desc = new RTCSessionDescription(msg.sdp);

//     // If the connection isn't stable yet, wait for it...

//     if (this.myPeerConnection.signalingState !== "stable") {
//       this.log(
//         "  - But the signaling state isn't stable, so triggering rollback"
//       );

//       // Set the local and remove descriptions for rollback; don't proceed
//       // until both return.
//       await Promise.all([
//         this.myPeerConnection.setLocalDescription({ type: "rollback" }),
//         this.myPeerConnection.setRemoteDescription(desc),
//       ]);
//       return;
//     } else {
//       this.log("  - Setting remote description");
//       await this.myPeerConnection.setRemoteDescription(desc);
//     }

//     // Get the webcam stream if we don't already have it

//     if (!this.webcamStream) {
//       try {
//         // this.webcamStream = await navigator.mediaDevices.getUserMedia(
//         //   mediaConstraints
//         // );

//         this.webcamStream = await navigator.mediaDevices.getDisplayMedia(
//           mediaConstraints
//         );

//         const streamId = this.webcamStream.id;
//         streamStore.set(streamId, this.webcamStream);
//         Dispatch(setLocalStreamId(streamId));
//       } catch (err) {
//         this.handleGetUserMediaError(err);
//         return;
//       }

//       // Add the camera stream to the RTCPeerConnection

//       try {
//         this.webcamStream.getTracks().forEach(
//           (this.transceiver = (track: any) =>
//             this.myPeerConnection.addTransceiver(track, {
//               streams: [this.webcamStream],
//             }))
//         );
//       } catch (err) {
//         this.handleGetUserMediaError(err);
//       }
//     }

//     this.log("---> Creating and sending answer to caller");

//     await this.myPeerConnection.setLocalDescription(
//       await this.myPeerConnection.createAnswer()
//     );
//     const message = new Message<ICallMessagePayload>(
//       this.me,
//       MessageType.CALL_MESSAGE,
//       "all",
//       {
//         name: "",
//         target: "",
//         type: "video-answer",
//         sdp: this.myPeerConnection.localDescription,
//       }
//     );

//     socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
//   };

//   private handleVideoAnswerMsg = async (msg: any) => {
//     this.log("*** Call recipient has accepted our call");

//     // Configure the remote description, which is the SDP payload
//     // in our "video-answer" message.

//     var desc = new RTCSessionDescription(msg.sdp);
//     await this.myPeerConnection
//       .setRemoteDescription(desc)
//       .catch(this.reportError);
//   };

//   private handleHangUpMsg = () => {
//     this.log("*** Received hang up notification from other peer");

//     this.closeVideoCall();
//   };

//   private handleNewICECandidateMsg = async (msg: any) => {
//     var candidate = new RTCIceCandidate(msg.candidate);

//     this.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
//     try {
//       await this.myPeerConnection.addIceCandidate(candidate);
//     } catch (err) {
//       this.reportError(err);
//     }
//   };

//   private handleNegotiationNeededEvent = async () => {
//     try {
//       this.log("---> Creating offer");
//       const offer = await this.myPeerConnection.createOffer();

//       // If the connection hasn't yet achieved the "stable" state,
//       // return to the caller. Another negotiationneeded event
//       // will be fired when the state stabilizes.

//       if (this.myPeerConnection.signalingState !== "stable") {
//         this.log("-- The connection isn't stable yet; postponing...");
//         return;
//       }

//       // Establish the offer as the local peer's current
//       // description.

//       this.log("---> Setting local description to the offer");
//       await this.myPeerConnection.setLocalDescription(offer);

//       // Send the offer to the remote peer.

//       this.log("---> Sending the offer to the remote peer");

//       const message = new Message<ICallMessagePayload>(
//         this.me,
//         MessageType.CALL_MESSAGE,
//         "all",
//         {
//           name: "me",
//           target: "you",
//           type: "video-offer",
//           sdp: this.myPeerConnection.localDescription,
//         }
//       );

//       socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
//     } catch (err) {
//       this.log(
//         "*** The following error occurred while handling the negotiationneeded event:"
//       );
//       this.reportError(err);
//     }
//   };

//   private handleICECandidateEvent = (event: any) => {
//     if (event.candidate) {
//       this.log("*** Outgoing ICE candidate: " + event.candidate.candidate);
//       const message = new Message<ICallMessagePayload>(
//         this.me,
//         MessageType.CALL_MESSAGE,
//         "all",
//         {
//           type: "new-ice-candidate",
//           target: "yadola",
//           candidate: event.candidate,
//         }
//       );

//       socketChannel.chatRoom.emit("chat-room", Message.serialize(message));
//     }
//   };

//   private handleICEConnectionStateChangeEvent = () => {
//     this.log(
//       "*** ICE connection state changed to " +
//         this.myPeerConnection.iceConnectionState
//     );

//     switch (this.myPeerConnection.iceConnectionState) {
//       case "closed":
//       case "failed":
//       case "disconnected":
//         this.closeVideoCall();
//         break;
//     }
//   };

//   private handleICEGatheringStateChangeEvent = () => {
//     this.log(
//       "*** ICE gathering state changed to: " +
//         this.myPeerConnection.iceGatheringState
//     );
//   };

//   private handleSignalingStateChangeEvent = () => {
//     this.log(
//       "*** WebRTC signaling state changed to: " +
//         this.myPeerConnection.signalingState
//     );
//     switch (this.myPeerConnection.signalingState) {
//       case "closed":
//         this.closeVideoCall();
//         break;
//     }
//   };

//   private handleTrackEvent = (event: any) => {
//     const streamId = event.streams[0].id;
//     streamStore.set(streamId, event.streams[0]);
//     Dispatch(setRemoteStreamId(streamId));
//   };

//   closeVideoCall() {
//     this.log("Closing the call");

//     // Close the RTCPeerConnection

//     if (this.myPeerConnection) {
//       this.log("--> Closing the peer connection");

//       // Disconnect all our event listeners; we don't want stray events
//       // to interfere with the hangup while it's ongoing.

//       this.myPeerConnection.ontrack = null;
//       this.myPeerConnection.onicecandidate = null;
//       this.myPeerConnection.oniceconnectionstatechange = null;
//       this.myPeerConnection.onsignalingstatechange = null;
//       this.myPeerConnection.onicegatheringstatechange = null;
//       this.myPeerConnection.onnegotiationneeded = null;

//       // Stop all transceivers on the connection

//       this.myPeerConnection.getTransceivers().forEach((transceiver) => {
//         transceiver.stop();
//       });

//       // Stop the webcam preview as well by pausing the <video>
//       // element, then stopping each of the getUserMedia() tracks
//       // on it.

//       //   if (localVideo.srcObject) {
//       //     localVideo.pause();
//       //     localVideo.srcObject.getTracks().forEach((track) => {
//       //       track.stop();
//       //     });
//       //   }

//       // Close the peer connection

//       this.myPeerConnection.close();
//       this.myPeerConnection = null;
//       Dispatch(setLocalStreamId(null));
//       Dispatch(setRemoteStreamId(null));
//       //   this.webcamStream = null
//     }
//   }

//   private handleGetUserMediaError = (event: any) => {
//     this.log_error(event);
//     switch (event.name) {
//       case "NotFoundError":
//         alert(
//           "Unable to open your call because no camera and/or microphone" +
//             "were found."
//         );
//         break;
//       case "SecurityError":
//       case "PermissionDeniedError":
//         // Do nothing; this is the same as the user canceling the call.
//         break;
//       default:
//         alert("Error opening your camera and/or microphone: " + event.message);
//         break;
//     }

//     // Make sure we shut down our end of the RTCPeerConnection so we're
//     // ready to try again.

//     this.closeVideoCall();
//   };

//   private log(text: string) {
//     console.log(text);
//   }

//   private reportError = (errMessage: any) => {
//     this.log(`Error ${errMessage.name}: ${errMessage.message}`);
//   };

//   private log_error(text: string) {
//     var time = new Date();

//     console.trace("[" + time.toLocaleTimeString() + "] " + text);
//   }
// }

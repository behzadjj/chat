export class WebRtc {
  private static instance: WebRtc;

  public static get Instance() {
    if (!WebRtc.instance) WebRtc.instance = new WebRtc();

    return WebRtc.instance;
  }
  myPeerConnection: RTCPeerConnection;

  constructor() {
    this.createPeerConnection();
  }

  createPeerConnection() {
    this.myPeerConnection = new RTCPeerConnection({
      iceServers: [
        // Information about ICE servers - Use your own!
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });

    this.myPeerConnection.onicecandidate = this.handleICECandidateEvent;
    this.myPeerConnection.ontrack = this.handleTrackEvent;
    this.myPeerConnection.onnegotiationneeded =
      this.handleNegotiationNeededEvent;
    // this.myPeerConnection.onremovetrack = this.handleRemoveTrackEvent;
    this.myPeerConnection.oniceconnectionstatechange =
      this.handleICEConnectionStateChangeEvent;
    this.myPeerConnection.onicegatheringstatechange =
      this.handleICEGatheringStateChangeEvent;
    this.myPeerConnection.onsignalingstatechange =
      this.handleSignalingStateChangeEvent;
  }

  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    console.log(event);
  };
  private handleTrackEvent = () => {};
  private handleNegotiationNeededEvent = () => {};
  //   private handleRemoveTrackEvent = () => {};
  private handleICEConnectionStateChangeEvent = () => {};
  private handleICEGatheringStateChangeEvent = () => {};
  private handleSignalingStateChangeEvent = () => {};
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IChatMessage, IChatState, IRoom, ICallMessage } from "@chat/models";

export type JoinPayload = { roomId: string; username: string };
export type CreatePayload = { roomName: string; username: string };
export type InitializePayload = { room: IRoom; userId: string };
export type LeavePayload = { roomId: string; userId: string };

const initialState: IChatState = {
  messages: [],
  roomName: undefined,
  videoCall: {
    streamId: undefined,
    remoteStreamId: undefined,
    activated: false,
  },
  roomId: undefined,
  user: {
    name: undefined,
    userId: undefined,
  },
  roomLink: undefined,
  isCreator: undefined,
  members: [],
  joined: false,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat(state) {
      state.messages = [];
    },
    receivedMessage(state, { payload }: PayloadAction<IChatMessage>) {
      state.messages.push(payload);
    },
    joinRoom(state, { payload }: PayloadAction<JoinPayload>) {
      state.isCreator = false;
      state.user.name = payload.username;
    },
    createRoom(state, { payload }: PayloadAction<CreatePayload>) {
      state.isCreator = true;
      state.user.name = payload.username;
    },
    roomInitialized(state, { payload }: PayloadAction<InitializePayload>) {
      state.members = payload.room.members;
      state.roomId = payload.room.roomId;
      state.roomName = payload.room.roomName;
      state.user.userId = payload.userId;
      state.joined = true;
    },
    setRoomMembers(state, { payload }: PayloadAction<IChatState["members"]>) {
      state.members = payload;
    },
    setJoined(state, { payload }: PayloadAction<boolean>) {
      state.joined = payload;
    },
    setLocalStreamId(state, { payload }: PayloadAction<string>) {
      state.videoCall.streamId = payload;
    },
    setRemoteStreamId(state, { payload }: PayloadAction<string>) {
      state.videoCall.remoteStreamId = payload;
    },
    setCallActivated(state, { payload }: PayloadAction<boolean>) {
      state.videoCall.activated = payload;
    },
    leaveRoom(_state, _: PayloadAction<LeavePayload>) {},
    receivedCallMessage(_state, _: PayloadAction<ICallMessage>) {},
  },
});

export const {
  clearChat,
  receivedMessage,
  roomInitialized,
  joinRoom,
  createRoom,
  setRoomMembers,
  setJoined,
  leaveRoom,
  receivedCallMessage,
  setRemoteStreamId,
  setLocalStreamId,
  setCallActivated,
} = chatSlice.actions;

export const chatReducer = chatSlice.reducer;

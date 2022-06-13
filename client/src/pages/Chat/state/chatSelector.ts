import { RoomUsers } from "./../../../models/room-user";
import { IReduxState } from "@chat/models";

export const selectMessages = (state: IReduxState) => state.chat.messages;

export const selectJoined = (state: IReduxState) => state.chat.joined;

export const selectRoomName = (state: IReduxState) => state.chat.roomName;

export const selectRoomId = (state: IReduxState) => state.chat.roomId;

export const selectRoomLink = (state: IReduxState) => state.chat.roomLink;

export const selectRoomMembers = (state: IReduxState) => state.chat.members;

export const selectUser = (state: IReduxState) => state.chat.user;

export const selectCallMode = (state: IReduxState) =>
  state.chat.videoCall.activated;

export const selectRemoteStreamId = (state: IReduxState) =>
  state.chat.videoCall.remoteStreamId;

export const selectLocalStreamId = (state: IReduxState) =>
  state.chat.videoCall.streamId;

export const selectStreamTarget = (state: IReduxState): RoomUsers => {
  return state.chat.members.find(
    (x) => x.userId === state.chat.videoCall.userId
  );
};

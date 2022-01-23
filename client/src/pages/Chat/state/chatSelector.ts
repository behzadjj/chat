import { IReduxState } from "models";

export const selectMessages = (state: IReduxState) => state.chat.messages;
export const selectJoined = (state: IReduxState) => state.chat.joined;
export const selectRoomName = (state: IReduxState) => state.chat.roomName;
export const selectRoomId = (state: IReduxState) => state.chat.roomId;
export const selectRoomLink = (state: IReduxState) => state.chat.roomLink;
export const selectRoomMembers = (state: IReduxState) => state.chat.members;
export const selectUser = (state: IReduxState) => state.chat.user;

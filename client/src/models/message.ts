import { RoomUsers } from "./room-user";

export enum MessageType {
  CHAT_MESSAGE = 0,
  USERS_LIST = 1,
  CALL_MESSAGE = 2,
}

export interface IMessage<T> {
  id?: string;
  from?: RoomUsers;
  to?: RoomUsers[] | "all";

  // Date of sending message
  sendDate?: Date | string;

  // Date of receive message by user
  receiveDate?: Date | string;

  type: MessageType;

  payload?: T;
}

/**
 * Internal chat message model
 */
export interface IChatMessagePayload {
  text?: string;

  // Date of read message by user
  readDate?: Date | string;

  // Message id of replaying message to
  replayTo?: string;

  // Peer ids of Users who read the message.
  viewedBy?: Array<string>;

  // Peer ids of users who receive the message.
  receivedBy?: Array<string>;

  chatMessageType: "FILE" | "TEXT";

  roomId?: string;
}

export interface ICallMessagePayload {
  type: any;
  target: string;
  sdp?: RTCSessionDescription;
  name?: string;
  candidate?: any;
}

/**
 * Internal chat message model
 */
export interface IUserListMessagePayload {
  users: Array<RoomUsers>;
}

export type IChatMessage = IMessage<IChatMessagePayload>;
export type ICallMessage = IMessage<ICallMessagePayload>;
export type IUserListMessage = IMessage<IUserListMessagePayload>;

export type IMessages = IChatMessage | IUserListMessage | ICallMessage;

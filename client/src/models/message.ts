export enum MessageType {
  CHAT_MESSAGE,
  USERS_LIST,
}

export interface IMessage<T> {
  id?: string;
  from?: string;
  to?: string[] | "all";

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

/**
 * Internal chat message model
 */
export interface IUserListMessagePayload {
  users: [];
}

export type IChatMessage = IMessage<IChatMessagePayload>;
export type IUserListMessage = IMessage<IUserListMessagePayload>;

export type IMessages = IChatMessage | IUserListMessage;

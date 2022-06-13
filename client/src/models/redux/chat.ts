import { IChatMessage, RoomUsers } from "models";

export interface IChatState extends IRoom {
  messages: Array<IChatMessage>;
  user: RoomUsers;
  isCreator: boolean;
  joined: boolean;
  videoCall: IVideoCallState;
}

export interface IVideoCallState {
  streamId: string;
  remoteStreamId: string;
  activated: boolean;
  userId: string;
}

export interface IRoom {
  members: Array<RoomUsers>;
  roomId: string;
  roomName: string;
  creator?: string;
  roomLink?: string;
}

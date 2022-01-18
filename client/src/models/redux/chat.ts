import { IChatMessage, RoomUsers } from "models";

export interface IChatState {
  messages: Array<IChatMessage>;
  roomName: string;
  roomId: string;
  user: RoomUsers;
  roomLink?: string;
  isCreator: boolean;
  members: Array<RoomUsers>;
}

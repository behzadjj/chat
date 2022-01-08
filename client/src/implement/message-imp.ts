import { nanoid } from "nanoid";
import { IMessage, MessageType, RoomUsers } from "@chat/models";

export class Message<T> implements IMessage<T> {
  id?: string;

  from?: RoomUsers;

  to?: RoomUsers[] | "all";

  // Date of sending message
  sendDate?: Date | string;

  // Date of receive message by user
  receiveDate?: Date | string;

  type: MessageType;

  payload?: T;

  constructor(
    sender: RoomUsers,
    type: MessageType,
    to: IMessage<T>["to"],
    payload?: T
  ) {
    this.from = sender;
    this.to = to;
    this.sendDate = new Date();
    this.id = nanoid();
    this.type = type;
    this.payload = payload;
  }

  static serialize<T>(message: T) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return JSON.stringify(message, (_: string, value: any) => {
      if (value instanceof Map) {
        return {
          dataType: "Map",
          value: Array.from(value.entries()),
        };
      }
      return value;
    });
  }

  static deserialize<T>(messageStr: string): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return JSON.parse(messageStr, (_: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (value.dataType === "Map") {
          return new Map(value.value);
        }
      }
      return value;
    });
  }
}

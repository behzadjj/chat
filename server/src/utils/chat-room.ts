import { nanoid } from "nanoid";
import { Room } from "../../model/room";

class ChatRoomClass {
  private static instance: ChatRoomClass;

  public static get Instance() {
    if (!ChatRoomClass.instance) ChatRoomClass.instance = new ChatRoomClass();

    return ChatRoomClass.instance;
  }
  rooms: Room[] = [];

  findRoomById = (roomId: string) => {
    const room = this.rooms.find((x: any) => x.roomId === roomId);

    if (!room) {
      throw new Error("BROKEN"); // Express will catch this on its own.
    }

    return room;
  };

  create(roomName: string, creatorName: string): Room {
    const userId = nanoid();
    const roomId = nanoid();
    const room: Room = {
      roomId,
      roomName,
      creator: userId,
      members: [
        {
          name: creatorName,
          rule: "moderator",
          userId,
        },
      ],
    };
    this.rooms.push(room);
    return room;
  }

  join(memberName: string, roomId: string): Room & { userId: string } {
    const room = this.findRoomById(roomId);

    const userId = nanoid();

    room.members.push({
      name: memberName,
      rule: "member",
      userId,
    });

    return { userId, ...room };
  }

  leave(roomId: string, userId: string): Room {
    const room = this.findRoomById(roomId);
    const userIndex = room.members.findIndex((x: any) => x.userId === userId);
    room.members.splice(userIndex, 1);
    return room;
  }
}

export const ChatRoom = ChatRoomClass.Instance;

import { nanoid } from "nanoid";
import { Member, Room } from "../../model/room";

export class ChatRoomClass {
  private static instance: ChatRoomClass;

  public static get Instance() {
    if (!ChatRoomClass.instance) ChatRoomClass.instance = new ChatRoomClass();

    return ChatRoomClass.instance;
  }
  rooms: Room[] = [];

  findRoomById = (roomId: string) => {
    const room = this.rooms.find((x: any) => x.roomId === roomId);

    if (!room) {
      console.warn("Room not found"); // Express will catch this on its own.
    }

    return room;
  };

  findMemberById = (userId: string, roomId: string): Member => {
    const room = this.findRoomById(roomId);

    const member = room.members.find((x: any) => x.userId === userId);

    if (!member) {
      console.warn("User not found"); // Express will catch this on its own.
    }
    return member;
  };

  create(
    roomName: string,
    creatorName: string
  ): { room: Room; userId: string } {
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
    return { room, userId };
  }

  join(memberName: string, roomId: string): { room: Room; userId: string } {
    const room = this.findRoomById(roomId);

    const userId = nanoid();

    room.members.push({
      name: memberName,
      rule: "member",
      userId,
    });

    return { room, userId };
  }

  leave(roomId: string, userId: string): Room {
    const room = this.findRoomById(roomId);
    if(!room){
      return;
    }
    const userIndex = room.members.findIndex((x: any) => x.userId === userId);
    room.members.splice(userIndex, 1);
    return room;
  }
}

export const ChatRoom = ChatRoomClass.Instance;

export interface Room {
  roomId: string;
  roomName: string;
  creator: string;
  members: Member[];
}

export interface Member {
  name: string;
  rule: string;
  userId: string;
}

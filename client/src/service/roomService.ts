import axios, { AxiosResponse } from "axios";
import { IRoom } from "models";

export interface CreateResponse {
  userId: string;
  room: IRoom;
}

const createRoom = (username: string, roomName: string) => {
  return axios.post<AxiosResponse<CreateResponse>>(
    "http://localhost:5000/chatroom/create",
    {
      username,
      roomName,
    }
  );
};

const joinRoom = (username: string, roomId: string) => {
  return axios.post<AxiosResponse<CreateResponse>>(
    "http://localhost:5000/chatroom/join",
    {
      username,
      roomId,
    }
  );
};
const leaveRoom = (userId: string, roomId: string) => {
  return axios.post<AxiosResponse<void>>(
    "http://localhost:5000/chatroom/leave",
    {
      userId,
      roomId,
    }
  );
};

export const RoomService = {
  createRoom,
  joinRoom,
  leaveRoom,
};

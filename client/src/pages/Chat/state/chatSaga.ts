import { PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, select, take, takeEvery } from "redux-saga/effects";
import { AxiosResponse } from "axios";
import { Socket } from "socket.io-client";
import { EventChannel } from "redux-saga";
import {
  ICallMessage,
  IMessages,
  MessageType,
  // RoomUsers,
  IChatMessage,
  IUserListMessage,
} from "@chat/models";

import { CreateResponse, RoomService } from "@chat/service/roomService";
import {
  receivedMessage,
  clearChat,
  joinRoom,
  createRoom,
  CreatePayload,
  JoinPayload,
  roomInitialized,
  InitializePayload,
  LeavePayload,
  setJoined,
  leaveRoom,
  // selectUser,
  selectRemoteStreamId,
  selectLocalStreamId,
  setRoomMembers,
  // receivedCallMessage,
} from ".";
import { initializeSocket, socketEventChannel } from "@chat/utils";
import { streamStore } from "@chat/utils/stream-store";
import { Message } from "@chat/implement";
import {
  answerCallRequest,
  callRequest,
  endCall,
  startCall,
} from "./chatSlice";
import {
  handleMessages,
  handleStartCall,
  hangUpCall,
  handleCallRequest,
  handleAnswerRequest,
} from "./webrtc";

function* socketMessageHandler(stringMessage: string) {
  const message = Message.deserialize(stringMessage) as IMessages;

  if (message.type === MessageType.CHAT_MESSAGE) {
    yield put(receivedMessage(message as IChatMessage));
  }

  if (message.type === MessageType.USERS_LIST) {
    const usersMessage = message as IUserListMessage;
    yield put(setRoomMembers(usersMessage.payload.users));
  }
  if (message.type === MessageType.CALL_MESSAGE) {
    const callMessage = message as ICallMessage;
    yield fork(handleMessages, callMessage);
  }
}

function* handleClearChat() {
  yield console.log("hello there");
}

function* handleJoinRoom({ payload }: PayloadAction<JoinPayload>) {
  let createResponse: AxiosResponse<CreateResponse>;
  try {
    createResponse = yield call(
      RoomService.joinRoom,
      payload.username,
      payload.roomId
    );
    const roomLink = `${document.location.protocol}//${document.location.host}/${createResponse.data.room.roomId}`;
    navigator.clipboard.writeText(roomLink);
    yield put(
      roomInitialized({
        room: createResponse.data.room,
        userId: createResponse.data.userId,
      })
    );
  } catch (error) {
    console.log(error);
    return;
  }
}

function* handleCreateRoom({ payload }: PayloadAction<CreatePayload>) {
  let createResponse: AxiosResponse<CreateResponse>;
  try {
    createResponse = yield call(
      RoomService.createRoom,
      payload.username,
      payload.roomName
    );
    const roomLink = `${document.location.protocol}//${document.location.host}/${createResponse.data.room.roomId}`;
    navigator.clipboard.writeText(roomLink);
    yield put(
      roomInitialized({
        room: createResponse.data.room,
        userId: createResponse.data.userId,
      })
    );
  } catch (error) {
    console.log(error);
    return;
  }
}

function* handleRoomInitialized({ payload }: PayloadAction<InitializePayload>) {
  const socket: Socket = yield call(
    initializeSocket,
    payload.userId,
    payload.room.roomId
  );
  const socketChannel: EventChannel<Socket> = yield call(
    socketEventChannel,
    socket
  );
  // yield initializeSocket(payload.userId, payload.room.roomId);

  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload: string = yield take(socketChannel);
      yield fork(socketMessageHandler, payload);
    } catch (err) {
      console.error("socket error:", err);
    }
  }
}

function* handleLeaveRoom({ payload }: PayloadAction<LeavePayload>) {
  try {
    yield call(RoomService.leaveRoom, payload.userId, payload.roomId);
    yield put(setJoined(false));
  } catch (error) {
    console.log(error);
    return;
  }
}

// function* handleReceivedCallMessaged({ payload }: PayloadAction<ICallMessage>) {
//   const user: RoomUsers = yield select(selectUser);
//   // webRTC.Instance.me = user;
//   if (payload.from.userId === user.userId) {
//     return;
//   }
//   yield fork(handleMessages, payload);
// }

function* handleEndCall() {
  const remoteStreamId: string = yield select(selectRemoteStreamId);
  const localStreamId: string = yield select(selectLocalStreamId);
  yield hangUpCall();
  streamStore.set(remoteStreamId, undefined);
  streamStore.set(localStreamId, undefined);
}

export function* chatSaga() {
  yield takeEvery(clearChat, handleClearChat);
  yield takeEvery(receivedMessage, handleClearChat);
  yield takeEvery(joinRoom, handleJoinRoom);
  yield takeEvery(createRoom, handleCreateRoom);
  yield takeEvery(roomInitialized, handleRoomInitialized);
  yield takeEvery(leaveRoom, handleLeaveRoom);
  yield takeEvery(endCall, handleEndCall);
  yield takeEvery(startCall, handleStartCall);
  yield takeEvery(callRequest, handleCallRequest);
  yield takeEvery(answerCallRequest, handleAnswerRequest);
}

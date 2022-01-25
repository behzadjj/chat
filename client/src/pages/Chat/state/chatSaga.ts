import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, select, takeEvery } from "redux-saga/effects";
import { AxiosResponse } from "axios";
import { ICallMessage, RoomUsers } from "@chat/models";

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
  selectUser,
} from ".";
import { initializeSocket } from "@chat/utils";
import { receivedCallMessage } from "./chatSlice";
import { webRTC } from "@chat/utils/webrtc";

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
  yield initializeSocket(payload.userId, payload.room.roomId);
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

function* handleReceivedCallMessaged({ payload }: PayloadAction<ICallMessage>) {
  const user: RoomUsers = yield select(selectUser);
  webRTC.Instance.me = user;
  yield webRTC.Instance.handleMessages(payload);
}

export function* chatSaga() {
  yield takeEvery(clearChat, handleClearChat);
  yield takeEvery(receivedMessage, handleClearChat);
  yield takeEvery(joinRoom, handleJoinRoom);
  yield takeEvery(createRoom, handleCreateRoom);
  yield takeEvery(roomInitialized, handleRoomInitialized);
  yield takeEvery(leaveRoom, handleLeaveRoom);
  yield takeEvery(receivedCallMessage, handleReceivedCallMessaged);
}

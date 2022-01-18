/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IChatMessage, IChatState } from "models";

const initialState: IChatState = {
  messages: [],
  roomName: undefined,
  roomId: undefined,
  user: undefined,
  roomLink: undefined,
  isCreator: undefined,
  members: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat(state) {
      state.messages = [];
    },
    receivedMessage(state, message: PayloadAction<IChatMessage>) {
      state.messages.push(message.payload);
    },
  },
});

export const { clearChat, receivedMessage } = chatSlice.actions;

export const chatReducer = chatSlice.reducer;

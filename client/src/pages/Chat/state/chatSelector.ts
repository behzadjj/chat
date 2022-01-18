import { IReduxState } from "models";

export const selectMessages = (state: IReduxState) => state.chat.messages;

import { takeEvery } from "redux-saga/effects";
import { receivedMessage, clearChat } from ".";

function* handleClearChat() {
  yield console.log("hello there");
}

export function* chatSaga() {
  yield takeEvery(clearChat, handleClearChat);
  yield takeEvery(receivedMessage, handleClearChat);
}

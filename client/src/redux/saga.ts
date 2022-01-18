import { all } from "redux-saga/effects";
import { chatSaga } from "@chat/pages";

const generators = [chatSaga()];

export function* rootSaga(): Generator<unknown, void, unknown> {
  yield all(generators);
}

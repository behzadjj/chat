import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { chatReducer } from "@chat/pages";
import { rootSaga } from "./saga";

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// declare middleware in this array
const middleWares = [sagaMiddleware];

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleWares),
});

sagaMiddleware.run(rootSaga);

export const Dispatch = store.dispatch;

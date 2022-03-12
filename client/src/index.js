import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { store } from "./redux";

import { Chat } from "./pages";

import "bootstrap/dist/css/bootstrap.css";
import "./style.scss";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Chat />} />
          <Route path='/:roomId' element={<Chat />} />
          <Route path='' element={() => <Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

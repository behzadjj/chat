import React from "react";
import ReactDOM from "react-dom";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";

import { Chat } from "./pages";
// We import bootstrap to make our application look better.
import "bootstrap/dist/css/bootstrap.css";
import "./style.scss";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Chat />} />
        <Route exact path='/:roomId' element={<Chat />} />
        <Route exact path='' render={() => <Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

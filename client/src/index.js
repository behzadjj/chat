import React from "react";
import ReactDOM from "react-dom";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";

import { Chat } from "./pages";
// We import bootstrap to make our application look better.
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Chat} />
        <Route exact path='/:roomId' component={Chat} />
        <Route exact path='' render={() => <Redirect to='/' />} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

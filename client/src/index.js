import React from "react";
import ReactDOM from "react-dom";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";

import App from "./App";
import { Chat } from "./pages";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path='/home' component={App} />
        <Route exact path='/chat' component={Chat} />
        <Route exact path='' render={() => <Redirect to='/home' />} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

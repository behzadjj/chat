import React from "react";

// We use Route in order to define the different routes of our application
import { Route } from "react-router-dom";

// We import all the components we need in our app
import Navbar from "./components/navbar";
import Edit from "./components/edit";
import Create from "./components/create";
import RecordList from "./components/recordList";

const App = () => {
  return (
    <div>
      <Navbar />
      <Route exact path='/home'>
        <RecordList />
      </Route>
      <Route path='home/edit/:id' component={Edit} />
      <Route path='home/create'>
        <Create />
      </Route>
    </div>
  );
};

export default App;

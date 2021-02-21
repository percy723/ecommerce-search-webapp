import React from 'react';
import './App.css';
import login from "./login"; 
import user from "./user";
import admin from "./admin";
import detail from "./detail";
import admin_loc from"./admin_loc";
import about from"./about";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }

  callAPI() {
      fetch("http://localhost:9000/testAPI")
          .then(res => res.text())
          .then(res => this.setState({ apiResponse: res }));
  }

  componentWillMount() {
      this.callAPI();

  }

  render(){
    return (
      <Router>
        <switch>
          <Route exact path="/"  component={login} />
          <Route path="/user" component={user} />
          <Route path="/detail" component={detail} />
          <Route path="/admin_user" component={admin} />
          <Route path="/admin_loc" component={admin_loc} />
          {/* <Route path="/about" component={about} /> */}
        </switch>
        {/* <p className="App-intro">{this.state.apiResponse}</p> */}
      </Router>
    );}
}

export default App;


//Tutorial: https://ipenywis.com/tutorials/Intro-to-React-Router-for-Beginners-%28Multiple-Page-Apps%29

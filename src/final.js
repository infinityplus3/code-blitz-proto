import React from "react";
import firebase from "firebase";
import config from "./elements/config";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import Look from "./components/look";
import Start from "./components/start";
import Game from "./components/game";

export default class Final extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: null,
      looking: false
    };
    try {
      firebase.initializeApp(config);
    } catch (e) {
      //console.error(e);
    }
    this.handleSetState = this.handleSetState.bind(this);
  }
  async handleSetState(newState) {
    console.log({ ...newState });
    await this.setState({ ...newState }, () => {
      console.log(this.state);
    });
  }
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/login">
            <Login state={this.state} collector={this.handleSetState} />
          </Route>
          <Route path="/signup">
            <Signup state={this.state} collector={this.handleSetState} />
          </Route>
          <Route exact path="/game">
            <Look state={this.state} collector={this.handleSetState} />
          </Route>
          <Route path="/game/:p1.:p2">
            <Game state={this.state} collector={this.handleSetState} />
          </Route>
          <Route path="/">
            <Start state={this.state} collector={this.handleSetState} />
          </Route>
        </Switch>
      </Router>
    );
  }
}

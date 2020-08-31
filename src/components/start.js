import React from "react";
//import firebase from "firebase";
import { Redirect, withRouter } from "react-router-dom";
//import history from "../elements/history"
import { newPage, getRemove } from "../elements/functions";
//import config from "../elements/config";
//import "./styles.css";

class Basic extends React.Component {
  constructor(props) {
    super(props);
    // try {
    //   firebase.initializeApp(config);
    // } catch (e) {
    //   console.error(e);
    // }
    this.state = {
      access: false
    };
    this.playAlready = this.playAlready.bind(this);
  }
  async componentDidMount() {
    await getRemove(this.props.collector);
  }
  async playAlready(event) {
    event.preventDefault();
    if (this.state.access) return console.log("no pliz");
    if (this.props.state.loggedin) {
      console.log({ ...this.props.state, looking: true });
      await this.props.collector({ ...this.props.state, looking: true });
      console.log(this.props.state);
      this.setState({ access: true });
      newPage("/game", this.props.state);
    } else {
      console.log("oops");
      newPage("/login", this.props.state);
    }
  }
  // decider(){
  //   if (!this.state.access) return console.log("no plz")
  //   console.log(this.props.state.loggedin)
  //   if (this.props.state.loggedin){
  //     console.log("here")
  //     return <Redirect from="/" to="/game"/>
  //   }
  //   else {
  //     console.log("herewenniybukjnlk")
  //     return <Redirect from="/" to="/login"/>
  //   }
  // }
  render() {
    return (
      <div className="App">
        <span>YAY</span>
        <button className="play" onClick={this.playAlready}>
          plz play :(
        </button>
      </div>
    );
  }
}

export default withRouter(Basic);

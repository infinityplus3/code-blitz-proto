import React from "react";
import firebase from "firebase";
// import config from "../elements/config";
//import "./styles.css";
import history from "../elements/history";
import { withRouter } from "react-router-dom";
import { newPage, getRemove } from "../elements/functions";

class Signup extends React.Component {
  constructor(props) {
    super(props);
    // try {
    //   firebase.initializeApp(config);
    // } catch (e) {
    //   console.error(e);
    // }
    this.state = {
      keys: {
        name: null,
        email: null,
        password: null
      },
      errors: {
        name: true,
        email: true,
        password: true
      },
      loggedin: null,
      access: false
    };
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  async passup() {
    let name = this.state.loggedin;
    let state = this.props.state;
    await this.props.collector({ ...state, loggedin: name });
  }
  async componentDidMount() {
    await getRemove(this.props.collector);
  }
  async handleUserChange(event) {
    let val = event.target.value;
    let thingy = await this.checkNewUser(val, "name");
    if (val.replace(" ", "") !== val)
      return this.setState({ errors: { ...this.state.errors, name: true } });
    if (thingy)
      return this.setState({ errors: { ...this.state.errors, name: true } });
    this.setState({
      keys: { ...this.state.keys, name: val },
      errors: { ...this.state.errors, name: null }
    });
  }
  async handleEmailChange(event) {
    let val = event.target.value;
    let thingy = await this.checkNewUser(val, "email");
    if (val.replace(" ", "") !== val)
      return this.setState({ errors: { ...this.state.errors, email: true } });
    if (!val.includes("@"))
      return this.setState({ errors: { ...this.state.errors, email: true } });
    if (thingy)
      return this.setState({ errors: { ...this.state.errors, email: true } });
    this.setState({
      keys: { ...this.state.keys, email: val },
      errors: { ...this.state.errors, email: null }
    });
  }
  async handlePasswordChange(event) {
    let val = event.target.value;
    if (val.replace(" ", "") !== val)
      return this.setState({
        errors: { ...this.state.errors, password: true }
      });
    if (!this.isAlphaNumeric(val))
      return this.setState({
        errors: { ...this.state.errors, password: true }
      });
    this.setState({
      keys: { ...this.state.keys, password: val },
      errors: { ...this.state.errors, password: null }
    });
  }
  async handleSubmit(event) {
    event.preventDefault();
    if (!this.state.access) {
      if (
        !(
          this.state.errors.name ||
          this.state.errors.email ||
          this.state.errors.password
        )
      ) {
        let id = await this.createId();
        this.writeUserData(
          id,
          this.state.keys.name,
          this.state.keys.email,
          this.state.keys.password
        );
        this.setState({
          loggedin: this.state.keys.name,
          access: true
        });
        newPage("/", this.props.state);
      }
    }
  }
  async createId() {
    let count = 0;
    let newId = this.randomString();
    // console.log(newId)
    // console.log(newId);
    let thingy = await this.checkNewUser(newId, "id");
    while (thingy && count < 1000) {
      newId = this.randomString();
      thingy = await this.checkNewUser(newId, "id");
      count++;
      //console.log("awwwwwww man");
    }
    if (count >= 1000) {
      return console.log(
        "Thing failed (through no fault of your own). Please press submit again."
      );
    }
    //console.log(newId)
    return newId;
  }
  async checkNewUser(wanted, actual) {
    let stuff = ["coins", "email", "password", "level", "id", "name", "xp"];
    let val = await firebase
      .database()
      .ref("users/")
      .once("value")
      .then((snapshot) => snapshot.val());
    //console.log(val);
    if (val) {
      let filler = Object.values(val).map((object) => Object.values(object));
      //console.log(filler);
      let place = [[], [], [], [], [], []];
      filler.forEach((arr) => {
        //console.log(arr)
        arr.forEach((thing) => {
          let i = arr.indexOf(thing);
          //console.log(place[i])
          place[i].push(thing);
        });
      });
      console.log(place[stuff.indexOf(actual)]);
      return place[stuff.indexOf(actual)].includes(wanted);
    }
    return false;
  }
  randomString() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : r & 0x3 || 0x8;
      return v.toString(16);
    });
  }
  writeUserData(userId, name, email, password) {
    //console.log({ name, userId, email });
    firebase
      .database()
      .ref("users/" + name)
      .set({
        userId: userId,
        username: name,
        email: email,
        password: password,
        level: 1,
        coins: 0,
        xp: 0
      });
  }
  isAlphaNumeric(input) {
    var regExp = /^[A-Za-z0-9]+$/;
    return input.match(regExp);
  }
  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          {this.state.errors.name ? (
            <label htmlFor="user"> Invalid! Username: </label>
          ) : (
            <label htmlFor="user">Username: </label>
          )}
          <input
            type="text"
            className="user"
            id="user"
            name="user"
            onChange={this.handleUserChange}
          />
          <br />
          <br />
          {this.state.errors.email ? (
            <label htmlFor="email">Invalid! Email: </label>
          ) : (
            <label htmlFor="email">Email: </label>
          )}
          <input
            type="text"
            className="email"
            name="email"
            onChange={this.handleEmailChange}
          />
          <br />
          <br />
          {this.state.errors.password ? (
            <label htmlFor="password">Invalid! Password: </label>
          ) : (
            <label htmlFor="password">Password: </label>
          )}
          <input
            type="password"
            className="password"
            name="password"
            onChange={this.handlePasswordChange}
          />
          <br />
          <br />
          <input className="buton" value="SUBMIT" type="submit" />
        </form>
      </div>
    );
  }
}

export default withRouter(Signup);

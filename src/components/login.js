import React from "react";
import firebase from "firebase";
import history from "../elements/history";
import { withRouter } from "react-router-dom";
import { newPage, getRemove } from "../elements/functions";
import publicIp from "react-public-ip";
//import config from "../elements/config";
//import "./styles.css";

class Login extends React.Component {
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
        password: null
      },
      errors: {
        name: true,
        password: true
      },
      access: false
    };
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleUserChange(event) {
    let val = event.target.value;
    this.setState({
      keys: { ...this.state.keys, name: val },
      errors: { ...this.state.errors, name: null }
    });
  }
  async componentDidMount() {
    await getRemove(this.props.collector);
  }
  handlePasswordChange(event) {
    let val = event.target.value;
    this.setState({
      keys: { ...this.state.keys, password: val },
      errors: { ...this.state.errors, password: null }
    });
  }
  async handleSubmit(event) {
    event.preventDefault();
    if (!this.state.access) {
      let arr = await this.checkUser();
      console.log(arr);
      let i = arr[5].indexOf(this.state.keys.name);
      if (i !== -1) {
        if (arr[3][i] === this.state.keys.password) {
          console.log("yoyle");
          this.setState({ access: true });
          await this.props.collector({
            ...this.props.state,
            loggedin: this.state.keys.name
          });
          newPage("/", this.props.state);
        } else {
          console.log("NO");
        }
      } else {
        console.log("NO");
      }
    }
  }
  async checkUser() {
    //let stuff = ["email", "password", "userId", "name"]
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
      //console.log(place[stuff.indexOf(actual)])
      return place;
    }
    return false;
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
          {this.state.errors.password ? (
            <label htmlFor="pw">Invalid! Password: </label>
          ) : (
            <label htmlFor="pw">Password: </label>
          )}
          <input
            type="password"
            className="pw"
            name="pw"
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

export default withRouter(Login);

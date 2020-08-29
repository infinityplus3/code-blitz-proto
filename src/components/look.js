import React from "react";
//import MonacoEditor from "react-monaco-editor";
import firebase from "firebase";
import { withRouter } from "react-router-dom";
import { newPage, getRemove, closer, transaction } from "../elements/functions";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }
  async componentDidMount() {
    await getRemove(this.props.collector).then(() => {
      if (!this.props.state.loggedin) {
        console.log("o noew");
        console.log(this.props.state);
        newPage("/", this.props.collector);
      }
    });
    this.matcher();
  }
  changef(object) {
    let lvls = object.levels;
    let thing = lvls.reduce((a, b) => a + b, 0) / lvls.length;
    return [lvls, { ...object, levels: thing }];
  }
  changeb(arr) {
    return { ...arr[1], levels: arr[0] };
  }
  async matcher() {
    let val = await firebase
      .database()
      .ref("gamerooms/")
      .once("value")
      .then((snapshot) => snapshot.val());
    let user = this.props.state.loggedin;
    let me = await Object.values(
      firebase
        .database()
        .ref(`users/`)
        .once("value")
        .then((snapshot) => snapshot.val())
    ).filter((obj) => obj.username === user);
    let lvl = me.level;
    if (val) {
      let values = Object.values(val).map((object) => this.changef(object));
      let unworthy = closer(lvl, values, true, 1);
      let worthy = unworthy.map((arr) => this.changeb(arr));
      worthy.forEach(async (obj) => {
        let key = Object.keys(val)[Object.values(val).indexOf(obj)];
        await transaction(
          `gamerooms/${key}`,
          function (ogval) {
            return {
              names: ogval.names.push(user),
              levels: ogval.levels.push(lvl)
            };
          },
          function (ogval) {
            return ogval.names.length < ogval.max;
          }
        ).then((ogval) => {
          if (ogval) {
            firebase
              .database()
              .ref(`gamerooms/${key}`)
              .once("value")
              .then((snapshot) => {
                let val = snapshot.val();
                if (val.names.length === val.max)
                  newPage(`/game/${val.players.join(".")}`, this.props.state);
              });
            firebase.database
              .ref(`gamerooms/${user}`)
              .on("value", function (snapshot) {
                let val = snapshot.val();
                if (val.players.length === val.max) {
                  newPage(`/game/${val.players.join(".")}`, this.props.state);
                }
              });
          }
        });
      });
    } else {
      let user = this.props.state.loggedin;
      let me = await Object.values(
        firebase
          .database()
          .ref(`users/`)
          .once("value")
          .then((snapshot) => snapshot.val())
      ).filter((obj) => obj.username === user);
      let lvl = me.level;
      firebase.database.ref(`gamerooms/${user}`).set({
        players: [user],
        levels: [lvl],
        max: 2
      });
      firebase.database
        .ref(`gamerooms/${user}`)
        .on("value", function (snapshot) {
          let val = snapshot.val();
          if (val.players.length === val.max) {
            newPage(`/game/${val.players.join(".")}`, this.props.state);
          }
        });
    }
  }
  render() {
    return <div>Loading...</div>;
  }
}

export default withRouter(Game);

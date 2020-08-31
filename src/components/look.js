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
    let allu = await firebase
      .database()
      .ref(`users/`)
      .once("value")
      .then((snapshot) => snapshot.val());
    let me = Object.values(allu).filter((obj) => obj.username === user);
    let lvl = me.level;
    if (val) {
      let values = Object.values(val).map((object) => this.changef(object));
      let unworthy = await closer(lvl, values, true, 1);
      // console.log(unworthy)
      let worthy = unworthy.map((arr) => this.changeb(arr));
      worthy.forEach(async (obj) => {
        // console.log(Object.values(val)[0])
        // console.log(obj)
        // console.log(obj === {...Object.values(val)[0]})
        let spread = Object.values(val).filter(
          (thing) =>
            thing.players === obj.players &&
            thing.max === obj.max &&
            thing.levels === obj.levels
        );
        let key = Object.keys(val)[Object.values(val).indexOf(spread[0])];
        await transaction(
          `gamerooms/${key}`,
          this.props.state,
          async function (ogval, state) {
            //console.log(ogval)
            let user = state.loggedin;
            let allu = await firebase
              .database()
              .ref(`users/`)
              .once("value")
              .then((snapshot) => snapshot.val());
            let me = Object.values(allu).filter((obj) => obj.username === user);
            let lvl = me[0].level;
            //console.log(ogval.players.filter(obj => obj === user))
            if (ogval.players.filter(obj => obj === user) !== []) {
              //console.log(ogval.players)
              let fake1 = [...ogval.players]
              fake1.push(user)
              let fake2 = [...ogval.levels]
              fake2.push(lvl)
              //console.log(ogval.levels)
              return {
                players: fake1,
                levels: fake2
              };
            }
            else {
              console.log("oh noes")
            }
          },
          function (ogval) {
            //console.log(ogval)
            return ogval.players.length < ogval.max;
          }
        ).then((ogval) => {
          console.log(ogval)
          if (ogval) {
            firebase
              .database()
              .ref(`gamerooms/${key}`)
              .once("value")
              .then((snapshot) => {
                let val = snapshot.val();
                if (val.players.length === val.max)
                  newPage(`/game/${val.players.join(".")}`, this.props.state);
              });
            firebase
              .database()
              .ref(`gamerooms/${key}`)
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
      let allu = await firebase
        .database()
        .ref(`users/`)
        .once("value")
        .then((snapshot) => snapshot.val());
      //console.log(allu)
      let me = Object.values(allu).filter((obj) => obj.username === user);
      console.log(me)
      let lvl = me[0].level;
      firebase
        .database()
        .ref(`gamerooms/${user}`)
        .set({
          players: [user],
          levels: [lvl],
          max: 2
        });
      firebase.database()
        .ref(`gamerooms/${user}`)
        .on("value", function (snapshot) {
          let val = snapshot.val();
          if (val.players.length === val.max) {
            newPage(`/game/${val.players.join(".")}`, this.props.state);
          }
          firebase.database().ref(`games/${user}`).set({...val})
      });
    }
  }
  render() {
    return <div>Loading...</div>;
  }
}

export default withRouter(Game);

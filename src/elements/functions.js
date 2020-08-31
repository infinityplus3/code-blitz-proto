import publicIp from "react-public-ip";
import firebase from "firebase";
import history from "./history";
import _ from "lodash"

async function newPage(link, state) {
  const ipv6 = await publicIp.v6();
  //console.log(state)
  await firebase
    .database()
    .ref(`misc/${ipv6}`)
    .set({ ...state });
  history.push(link);
  window.location.reload();
}

async function getRemove(callback) {
  const ipv6 = await publicIp.v6();
  //console.log(ipv6)
  let val = await firebase
    .database()
    .ref(`misc/${ipv6}`)
    .once("value")
    .then((snapshot) => snapshot.val());
  //console.log(val)
  await callback(val);
  //firebase.database().ref(`misc/${ipv6}`).remove();
}

async function closer(needle, haystack, bool, index) {
  let copy = haystack;
  if (bool) {
    copy.sort((a, b) => {
      return (
        Math.abs(needle - Object.values(a[1])[index]) -
        Math.abs(needle - Object.values(b[1])[index])
      );
    });
  } else {
    copy.sort((a, b) => {
      return Math.abs(needle - a) - Math.abs(needle - b);
    });
  }
  return copy;
}

function isEquivalent(a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length !== bProps.length) {
      return false;
  }

  for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
          return false;
      }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}

async function transaction(link, state, change, check, callback) {
  let ogval = await firebase
    .database()
    .ref(link)
    .once("value")
    .then((snapshot) => snapshot.val());
  let count = 0;
  while (count <= 10) {
    let bool = await check(ogval)
    //console.log(bool)
    if (bool) {
      console.log("im here")
      let newobj = Object.assign({}, ogval);
      let changey = await change(ogval, state)
      let returner = Object.assign(newobj, changey)
      let newval = await firebase
        .database()
        .ref(link)
        .once("value")
        .then((snapshot) => snapshot.val());
      if (_.isEqual(ogval, newval)) {
        console.log(returner)
        await firebase.database().ref(link).set(returner);
        console.log(ogval)
        console.log("_______")
        return ogval;
      }
    } else {
      return console.log("oopsies");
    }
    count++;
  }
}

export { newPage, getRemove, closer, transaction };

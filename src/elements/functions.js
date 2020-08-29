import publicIp from "react-public-ip";
import firebase from "firebase";
import history from "./history";

async function newPage(link, state) {
  const ipv6 = await publicIp.v6();
  firebase
    .database()
    .ref(`misc/${ipv6}`)
    .set({ ...state });
  history.push(link);
  window.location.reload();
}

async function getRemove(callback) {
  const ipv6 = await publicIp.v6();
  let val = firebase
    .database()
    .ref(`misc/${ipv6}`)
    .once("value")
    .then((snapshot) => snapshot.val());
  await callback(val);
  firebase.database().ref(`misc/${ipv6}`).remove();
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

async function transaction(link, change, check, callback) {
  let ogval = firebase
    .database()
    .ref(link)
    .once("value")
    .then((snapshot) => snapshot.val());
  let count = 0;
  while (count <= 10) {
    if (check(ogval)) {
      let returner = { ...ogval, ...change(ogval) };
      let newval = firebase
        .database()
        .ref(link)
        .once("value")
        .then((snapshot) => snapshot.val());
      if (newval === ogval) {
        firebase.database.ref(link).set(returner);
        return ogval;
      }
    } else {
      return console.log("oopsies");
    }
    count++;
  }
}

export { newPage, getRemove, closer, transaction };


/*
 * Client side:
 *
 * This module uses firebase realtime database
 * for establishing a two player game between
 * players.
 */

let firebase = require('firebase');
const debug = require("debug")("firebase-client");

let db;
let lastMoveKey = null;

module.exports.initialize = function (config) {
  firebase.initializeApp(config);
  db = firebase.database();
}

module.exports.registerUser = function(token) {
  return firebase.auth().signInWithCustomToken(token);
}

module.exports.unregisterUser = function() {
  return firebase.auth().signOut();
}

module.exports.startGame = function(gid, uid,
      onStartMatch, onCompleteMatch, onReceiveMove, onAckMove) {

  let theGameRef = db.ref('games/' + gid);
  let stateRef = theGameRef.child("/status/state");
  let movesRef = theGameRef.child("/moves");

  stateRef.on("value", snapshot => {
    debug('state change');
    let data = snapshot.val();
    if (data === null) return;

    if (data === "BOTH_JOINED") {
      onStartMatch(gid);
    }
    if (data === "COMPLETE") {
      onCompleteMatch(gid);
      movesRef.removeAllListeners();
      stateRef.removeAllListeners();
      gameRef = stateRef = movesRef = null;
    }
  });

  movesRef.limitToLast(1).on("child_added", snapshot => {
    let data = snapshot.val();
    if (data === null) return;
    let key = snapshot.key;
    debug('<---- ' + key);

    if (data.uid !== uid) {
      onReceiveMove(data);
    } else if (lastMoveKey === key) {
      onAckMove();
    } else {
      console.warn(`Ignore unexpected Ack: Received ${key}, Expected ${lastMoveKey}`);
    }
  });
}

module.exports.makeMove = function(gid, uid, num, moveInfo) {
  return (new Promise((resolve, reject) => {
    const movesRef = db.ref('games/' + gid + '/moves');
    let ref = movesRef.push();
    ref.set({
      uid,
      num,
      moveInfo,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    }, error => {
      if(error) {
        reject(error);
      } else {
        lastMoveKey = ref.key;
        debug('---> ' + lastMoveKey)
        resolve();
      }
    })
  }))
}

module.exports.getMoves = function(gid) {
  return (new Promise((resolve, reject) => {
    let movesRef = db.ref('games/' + gid + "/moves");
    movesRef.once("value", snapshot => {
      const data = snapshot.val();
      if (data === null) return;

      const keys = Object.keys(data);
      const moves = keys.map(k => data[k]);
      resolve(moves);
    }, error => {
      reject(error);
    })
  }))
}

// TODO how to handle disconnections

/*
 * Server side:
 * This module uses firebase realtime database
 * for establishing a two player game between
 * players.
 */

const admin = require("firebase-admin");
const debug = require("debug")("firebase-server");

/*
 * config should have following
 *   - apiKey, authDomain, databaseUrl, storageBucket
 */
exports.initialize = function(databaseURL, serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL
  });
}

  // returns a customToken that has to be used by the user
exports.authUser = function(uid) {
  return admin.auth().createCustomToken(uid);
}

exports.createGame = function(uid, gameInfo) {
  return (new Promise((resolve, reject) => {
    let gameRef = admin.database().ref('games').push();
    gameRef.set({
      "status": {
        "state": "CREATED",
        "gameInfo": gameInfo,
        "players": {
          [uid]: true
        },
        "createdAt": Date.now(),
        "startedAt": null,
        "endedAt": null,
        "winner": null,
      }
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(gameRef.key);
      }
    });
  }))
}

exports.joinGame = function(gid, uid) {
  return (new Promise((resolve, reject) => {
    //console.log("Before-Transaction " + gid + "/status");
    const gameStatusPath = "games/" + gid + "/status";
    let statusRef = admin.database().ref(gameStatusPath);
    statusRef.transaction(
      function(status) {
        //console.log('Inside-Transaction');
        if (status !== null && status.state !== "BOTH_JOINED") {
          if (!status.players[uid]) { // not already joined
            status.players[uid] = true;
            status.state = "BOTH_JOINED";
            status.startedAt = Date.now();
          }
        }
        return status;
      },
      function(error, comitted, snapshot) {
        if (error) {
          reject(error);
        } else if (!comitted) {
          debug('not comitted');
        } else {
          const data = snapshot.val();
          debug(data);
          resolve(data);
        }
      }
    );
  }));
}

exports.endGame = function (gid, uid) {
  return (new Promise((resolve, reject) => {
    //console.log("Before-Transaction " + gid + "/status");
    const gameStatusPath = "games/" + gid + "/status";
    let statusRef = admin.database().ref(gameStatusPath);
    statusRef.transaction(
      function(status) {
        //console.log('Inside-Transaction');
        if (status !== null && status.state === "BOTH_JOINED") {
          if (status.players[uid]) {
            status.state = "COMPLETED";
            status.endedAt = Date.now();
          }
        }
        return status;
      },
      function(error, comitted, snapshot) {
        if (error) {
          reject(error);
        } else if (!comitted) {
          debug('not comitted');
        } else {
          const data = snapshot.val();
          debug(data);
          resolve(data);
        }
      }
    );
  }))
}

exports.getGameStatus = function(gid) {
  return (new Promise((resolve, reject) => {
    const gameStatusPath = "games/" + gid + "/status";
    let statusRef = admin.database().ref(gameStatusPath);
    statusRef.on("value",
      snapshot => {
        const data = snapshot.val();
        debug(data);
        if (data !== null) {
          resolve(data);
        }
      }, error => {
        debug("The read failed: " + error.code);
        reject();
      }
    )
  }))
}

// TODO how to handle disconnections

exports.dumpAllGames = function () {
  return (new Promise((resolve) => {
    const ref = admin.database().ref("games");
    ref.once('value', snapshot => {
      snapshot.forEach(data => {
        console.log(data.key);
      })
      resolve();
    })
  }))
}

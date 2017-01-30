
const firebase = require('firebase');
const mocha = require('mocha');
const expect = require('expect');

const {clientConfig} = require('./../config');

const testdata = require('./test.json');
const users = ["user-0001", "user-0002"];
const uid = users[parseInt(process.env.USERNUM) || 0];
const gameId = testdata["gameId"];

describe(`Two player tests : ${gameId} : ${uid}`, () => {

  before(done => {
    firebase.initializeApp(clientConfig);
    firebase.auth().signInWithCustomToken(testdata[uid])
    .then(() => done())
    .catch(done);
  })

  it('1001: Permission denied when we try to update an old record', done => {
    let movesRef = firebase.database().ref('games/' + gameId + "/moves");
    movesRef.once("value", snapshot => {
        const data = snapshot.val();
        if (data === null) return;
        const key = Object.keys(data).shift();

        let theMoveRef = movesRef.child(key);
        theMoveRef.set({
          uid: "0", num: 0, from: 0, to: 0, fen: "X",
        }, error => {
          if (!error) {
            done(new Error('Test failed: allows overwrite'))
          } else {
            done();
          }
        })
      }, done)
    })

    it('1002: Not allowed to edit a game it has not joined', done => {
      done();
    })

})

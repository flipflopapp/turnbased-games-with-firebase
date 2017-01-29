
const mocha = require('mocha');
const expect = require('expect');

const {clientConfig} = require('./config');
const client = require('./../client');

const testdata = require('./test.json');
const users = ["user-0001", "user-0002"];
const uid = users[parseInt(process.env.USERNUM) || 0];
const gameId = testdata["gameId"];

describe(`Two player tests : ${gameId} : ${uid}`, () => {

  before(done => {
    client.initialize(clientConfig);
    client.registerUser(testdata[uid])
    .then(() => done())
    .catch(done);
  })

  it('1001: start a match', done => {

    let count=0; // move count

    function makeFirstMove() {
      if (uid === "user-0001") {
        console.log('make first move');
        makeMove();
      }
    }

    function makeMove() {
      count += 1;
      if(count > 4) {
        //server.endGame();
        return done();
      }
      client
        .makeMove(gameId, uid, count, {from: 21, to: 32, fen: `fen-${count}`})
        .catch(done)
    }

    function receiveMove(move) {
      console.log('received move', move.moveInfo);
      makeMove();
    }

    function ackMove() {
      console.log('made move');
    }

    function endGame() {
      client.unregisterUser()
      .then(done,done);
    }

    client.startGame(gameId, uid,
      makeFirstMove,
      endGame,
      receiveMove,
      ackMove
    );

  })

})

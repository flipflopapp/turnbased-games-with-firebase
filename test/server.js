
const mocha = require('mocha');
const expect = require('expect');
const fs = require('fs');

const server = require('./../server');
const {databaseURL, serviceAccount} = require('./config');

describe('Two player tests', () => {

  before(done => {
    server.initialize(databaseURL, serviceAccount);
    done();
  })

  it('1001: should be able to create/auth user', done => {
    server.authUser("user-0001")
    .then(token1 => {
      return server.authUser("user-0002")
      .then(token2 => {
        saveData({
          "user-0001": token1,
          "user-0002": token2,
        }, done)
      })
    })
    .catch(done);
  })

  it('2001: should create a new game', done => {
    server.createGame("user-0001", "rqkr/nbbn/4/4/4/4/NBBN/RQKR w - - 1 1")
    .then(gameId => {
      //console.log(gameId);
      expect(!!gameId).toEqual(true);
      saveData({"gameId": gameId}, done);
    })
    .catch(done);
  })

  describe('300X: Join game tests', () => {

    before(done => {
      readData(done);
    })

    it('3001: should be already joined in game', done => {
      const userId = "user-0001";
      const gameId = testData.gameId;
      //console.log(gameId);
      server.joinGame(gameId, userId)
      .then(() => server.getGameStatus(gameId))
      .then(data => {
        expect(data.state).toEqual('CREATED');
        done();
      })
      .catch(done);
    })

    it('3002: should join the game', done => {
      const userId = "user-0002";
      const gameId = testData.gameId;
      //console.log(gameId);
      server.joinGame(gameId, userId)
      .then(() => server.getGameStatus(gameId))
      .then(data => {
        expect(data.state).toEqual('BOTH_JOINED');
        done();
      })
      .catch(done);
    })

  })

  describe('400X: Misc tests', () => {

    before(done => {
      readData(done);
    })

    it('4001: should read game info', done => {
      const gameId = testData.gameId;
      server.getGameStatus(gameId)
      .then(data => {
        console.log(data);
        done();
      })
      .catch(done);
    })

    it('4002: should end the game', done => {
      const gameId = testData.gameId;
      server.endGame(gameId, "user-0001")
      .then(() => server.getGameStatus(gameId))
      .then(data => {
        expect(data.state).toEqual('COMPLETED');
        expect(data.endedAt).toNotEqual(null);
        done();
      })
      .catch(done);
    })

  })
})

// Test data

let testDataFile = 'test/test.json';
let testData = {};

function readData(done) {
  fs.readFile(testDataFile, (err, data) => {
    if (!err) {
      testData = (data && JSON.parse(data)) || {};
    }
    done();
  });
}

function saveData(vals, done) {
  readData(() => {
    for(var key in vals) {
      testData[key] = vals[key];
    }
    fs.writeFile(testDataFile, JSON.stringify(testData), done)
  })
}

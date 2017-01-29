
const mocha = require('mocha');
const fs = require('fs');

const server = require('./../server');
const {databaseURL, serviceAccount} = require('./../config');


describe('Dump data test', () => {
  before(done => {
    server.initialize(databaseURL, serviceAccount);
    done();
  })

  it('3001: should dump all games', done => {
    server.dumpAllGames()
    .then(done, done);
  })
})

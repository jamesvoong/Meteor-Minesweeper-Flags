import {GamesController} from "../controllers/gamesController.js";

export const newGame = new ValidatedMethod({
  name: 'games.newGame',
  validate: new SimpleSchema({}).validator(),
  run({}) {
    GamesController.newGame(Meteor.user());
  }
});

export const userJoinGame = new ValidatedMethod({
  name: 'games.userJoinGame',
  validate: new SimpleSchema({
    gameId: {type: String}
  }).validator(),
  run({gameId}) {
    GamesController.userJoinGame(gameId, Meteor.user());
  }
});

export const userStartGame = new ValidatedMethod({
  name: 'games.userStartGame',
  validate: new SimpleSchema({
    gameId: {type: String}
  }).validator(),
  run({gameId}) {
    GamesController.userStartGame(gameId, Meteor.user());
  }
});

export const userShuffle = new ValidatedMethod({
  name: 'games.userShuffle',
  validate: new SimpleSchema({
    gameId: {type: String}
  }).validator(),
  run({gameId}) {
    GamesController.userShuffle(gameId, Meteor.user());
  }
});

export const userSwitchMode = new ValidatedMethod({
  name: 'games.userSwitchMode',
  validate: new SimpleSchema({
    gameId: {type: String}
  }).validator(),
  run({gameId}) {
    GamesController.userSwitchMode(gameId, Meteor.user());
  }
});

export const userLeaveGame = new ValidatedMethod({
  name: 'games.userLeaveGame',
  validate: new SimpleSchema({
    gameId: {type: String}
  }).validator(),
  run({gameId}) {
    GamesController.userLeaveGame(gameId, Meteor.user());
  }
});

export const userMarkGame = new ValidatedMethod({
  name: 'games.userMarkGame',
  validate: new SimpleSchema({
    gameId: {type: String},
    row: {type: Number},
    col: {type: Number}
  }).validator(),
  run({gameId, row, col}) {
    GamesController.userMarkGame(gameId, Meteor.user(), row, col);
  }
});

export const userSelectGame = new ValidatedMethod({
  name: 'games.userSelectGame',
  validate: new SimpleSchema({
    gameId: {type: String},
    row: {type: Number},
    col: {type: Number}
  }).validator(),
  run({gameId, row, col}) {
    GamesController.userSelectGame(gameId, Meteor.user(), row, col);
  }
});

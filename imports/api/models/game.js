/**
 * GameStatus constants
 */
export const GameStatuses = {
  WAITING: 'WAITING',  // waiting player to join
  STARTED: 'STARTED',  // all spots are filled; can start playing
  FINISHED: 'FINISHED', // game is finished
  ABANDONED: 'ABANDONED' // all players left; game is abandoned
}

/**
 * Game model, encapsulating game-related logics
 * It is data store independent
 */
export class Game {
  /**
   * Constructor accepting a single param gameDoc.
   * gameDoc should contain the permanent fields of the game instance.
   * Normally, the fields are saved into data store, and later get retrieved
   *
   * If gameDoc is not given, then we will instantiate a new object with default fields
   *
   * @param {Object} [gameDoc] Optional doc retrieved from Games collection
   */
  constructor(gameDoc) {
    if (gameDoc) {
      _.extend(this, gameDoc);
    } else {
      this.status = GameStatuses.WAITING;
      this.players = [];
      this.scores = new Array(8).fill(0);
      this.turnOrder = [];
      this.currentTurn = 0;
      this.board = new Array(16);
      this.hasBomb = [];
      this.lastSelected = [null, null];
      for (var i = 0; i < this.board.length; i++) {
        this.board[i] = new Array(16);
      }

      var mineCount = 0;

      this.hiddenBoard = new Array(16);
      for (var i = 0; i < this.hiddenBoard.length; i++) {
        this.hiddenBoard[i] = new Array(16);
      }
      while(mineCount < 51) {
        x = Math.floor((Math.random() * 16));
        y = Math.floor((Math.random() * 16));
        if (this.hiddenBoard[y][x]!= 'M') {
          this.hiddenBoard[y][x] = 'M';
          mineCount += 1;

          for (var j = x-1; j < x+2; j++) {
            for (var k = y-1; k < y+2; k++) {
              if ((j >= 0) && (j <=15) && (k >= 0) && (k <= 15)) {
                if (typeof this.hiddenBoard[k][j] == 'undefined') {
                  this.hiddenBoard[k][j] = 1;
                } else if (this.hiddenBoard[k][j] == 'M') {

                } else {
                  this.hiddenBoard[k][j] += 1;
                }
              }
            }
          }
        }
      }

      console.log(this.hiddenBoard);
    }
  }

/**
   * Return a list of fields that are required for permanent storage
   *
   * @return {[]String] List of fields required persistent storage
   */
  persistentFields() {
    return ['status', 'board', 'hiddenBoard', 'players', 'scores', 'turnOrder', 'hasBomb', 'currentTurn', 'lastSelected'];
  }

/**
   * Handle join game action
   *
   * @param {User} user Meteor.user object
   */
  userJoin(user) {
    if (this.status !== GameStatuses.WAITING) {
      throw "cannot join at current state";
    }
    if (this.userIndex(user) !== null) {
      throw "user already in game";
    }

    this.players.push({
      userId: user._id,
      username: user.username
    });

// game automatically start with 2 players
    if (this.players.length === 2) {
      this.status = GameStatuses.STARTED;
    }
  }

/**
   * Handle leave game action
   *
   * @param {User} user Meteor.user object
   */
  userLeave(user) {
    if (this.status !== GameStatuses.WAITING) {
      throw "cannot leave at current state";
    }
    if (this.userIndex(user) === null) {
      throw "user not in game";
    }
    this.players = _.reject(this.players, (player) => {
      return player.userId === user._id;
    });

// game is considered abandoned when all players left
    if (this.players.length === 0) {
      this.status = GameStatuses.ABANDONED;
    }
  }

/**
   * Handle user action. i.e. putting marker on the game board
   *
   * @param {User} user
   * @param {Number} row Row index of the board
   * @param {Number} col Col index of the board
   */
  userMark(user, row, col) {
    let playerIndex = this.userIndex(user);
    let currentPlayerIndex = this.currentTurn;

    if (currentPlayerIndex !== playerIndex) {
      throw "user cannot make move at current state";
    }
    if (row < 0 || row >= this.board.length || col < 0 || col >= this.board[row].length) {
      throw "invalid row|col input";
    }
    if (this.board[row][col] !== null) {
      throw "spot is filled";
    }
    targetValue = this.hiddenBoard[row][col];

    if (targetValue == "M") {
      this.board[row][col] = "P" + playerIndex;
      this.scores[currentPlayerIndex] += 1
    } else if (targetValue === null) {
      this.traverseZero(row, col);
      this.currentTurn = (this.currentTurn + 1) % 2;
    } else {
      this.board[row][col] = targetValue;
      this.currentTurn = (this.currentTurn + 1) % 2;
    }

    this.lastSelected = [null, null];
    let winner = this.winner();
    if (winner !== null) {
      this.status = GameStatuses.FINISHED;
    }
  }

  userSelect(user, row, col) {
    let playerIndex = this.userIndex(user);
    let currentPlayerIndex = this.currentTurn;

    if (currentPlayerIndex !== playerIndex) {
      throw "user cannot make move at current state";
    }
    if (row < 0 || row >= this.board.length || col < 0 || col >= this.board[row].length) {
      throw "invalid row|col input";
    }
    if (this.board[row][col] !== null) {
      throw "spot is filled";
    }
    if ((this.lastSelected[0] == row) && (this.lastSelected[1] == col)) {
      console.log('Returning True in selection')
      this.lastSelected = [null, null];
      return true;
    } else {
      console.log('Returning null in selection')
      this.lastSelected = [row, col];
      return null;
    }

  }

  traverseZero(row, col) {
    console.log("Using function traverseZero")
    this.board[row][col] = 0;
    for (var j = row-1; j < row+2; j++) {
      for (var k = col-1; k < col+2; k++) {
        if ((j >= 0) && (j <=15) && (k >= 0) && (k <= 15)) {
          if (this.board[j][k] === null) {
            console.log(this.hiddenBoard[j][k])
            if (this.hiddenBoard[j][k] === null) {
              this.traverseZero(j,k);
            } else {
              this.board[j][k] = this.hiddenBoard[j][k];
            }
          }
        }
      }
    }
  }

  winner() {
    for (let i = 0; i < this.scores.length; i++) {
      if (this.scores[i] >= 26) {
        return i;
      }
    }

    return null;
  }

/**
   * Helper method to retrieve the player index of a user
   *
   * @param {User} user Meteor.user object
   * @return {Number} index 0-based index, or null if not found
   */
  userIndex(user) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].userId === user._id) {
        return i;
      }
    }
    return null;
  }
}

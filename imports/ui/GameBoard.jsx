import React, { Component } from 'react';
import GameHeader from './GameHeader.jsx';
import {Game, GameStatuses} from '../api/models/game.js';
import {userMarkGame, userSelectGame} from '../api/methods/games.js';

export default class GameBoard extends Component {
  handleCellClick(row, col) {
    console.log('Handling Click')
    let game = this.props.game;
    if (game.status === GameStatuses.FINISHED) return;
    if (game.currentTurn !== game.userIndex(this.props.user)) return;
    if (game.lastSelected[0] != row || game.lastSelected[1] != col) {
      userSelectGame.call({gameId: game._id, row: row, col: col})
    } else {
      userMarkGame.call({gameId: game._id, row: row, col: col});
      if (game.hiddenBoard[row][col] == 'M') {
        new Audio('/audio/Flag.mp3').play();
      } else {
        new Audio('/audio/Sploosh.mp3').play();
      }

    }
  }

  handleBackToGameList() {
    this.props.backToGameListHandler();
  }

  renderCell(row, col) {
    let game = this.props.game;
    let value = game.board[row][col];
    let LSR = game.lastSelected[0];
    let LSC = game.lastSelected[1];
    let LMR = game.lastMove[0];
    let LMC = game.lastMove[1];
    console.log(game.currentTurn);
    console.log(game.userIndex(this.props.user));
    if (value === null && LSR == row && LSC == col && game.currentTurn == game.userIndex(this.props.user)) {
      console.log("lastSelected changed")
      return (
        <td onClick={this.handleCellClick.bind(this, row, col)}>
          <img src="/images/notDiscoveredSelect.png" height="44" width="44"/>
        </td>
      );
    } else if (value === null) {
      return (
        <td onClick={this.handleCellClick.bind(this, row, col)}>
          <img src="/images/notDiscovered.png" height="44" width="44"/>
        </td>
      );
    } else if (LMR == row && LMC == col) {
      var source = '/images/' + String(value) + 'L.png';
      return (
        <td>
          <img src={source} height="44" width="44"/>
        </td>
      )
    } else {
      var source = '/images/' + String(value) + '.png';
      return (
        <td>
          <img src={source} height="44" width="44"/>
        </td>
      )
    }

  }

  renderStatus() {
    let game = this.props.game;
    let status = "";
    if (game.status === GameStatuses.STARTED) {
      let playerIndex = game.currentTurn;
      imgSource = "/images/P" + String(playerIndex) + ".png"
      status = `Current Turn: ${game.players[playerIndex].username}`;
    } else if (game.status === GameStatuses.FINISHED) {
      imgSource = "/images/gameOver.png";
      status = "Game Over!";
    }

    return (
      <div className="ui huge image label">
        <img src={imgSource}/>
        {status}
      </div>
    )
  }

  renderPlayers(){
      numArray = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
      let children = [];
      let game = this.props.game;
      //Inner loop to create children
      for (let j = 0; j < game.players.length; j++) {
        imgSource = "/images/P" + String(j) + ".png"
        playerName = this.props.game.players[j].username
        playerScore = this.props.game.scores[j]
        if (game.finished[j] == true) {
          children.push(<div className="ui column"><img src={imgSource} height="44" width="44"/><br/>{playerName}<br/><b>{playerScore} Finished!</b></div>);
        } else {
          children.push(<div className="ui column"><img src={imgSource} height="44" width="44"/><br/>{playerName}<br/>{playerScore}</div>);
        }
      }
      cname = `ui ${numArray[game.players.length-2]} column center aligned row`;

    return (
      <div className={cname}>
        {children}
      </div>
    )
  }

  renderBomb(playerIndex) {
    let game = this.props.game;
    if (game.hasBomb[playerIndex] == false) {
      return (
        <img src='/images/megaBombUsed.png' height="47" width="65"/>
      )
    } else if (game.hasBomb[playerIndex] == true && game.scores[playerIndex] < game.scores[(playerIndex+1)%2]) {
      return (
        <img src='/images/megaBombUnused.png' height="47" width="65"/>
      )
    } else {
      return (
        <img src='/images/megaBombDisabled.png' height="47" width="65"/>
      )
    }


  }

  renderInfo() {
    let game = this.props.game;
    let status = "";

    minesRemaining = `Mines Remaining: ${game.remainingMines}`;
    minesToFinish = `Flags Needed to Finish: ${game.winCondition[game.players.length-1]}`;
    gameMode = `GameMode: ${game.gameMode}`;

    return (
      //<div><img src='/images/M.png' height="44" width="44"/>{minesRemaining}<br/>{minesToFinish}<br/>{gameMode}</div>
      <div>
          <div className="ui huge image label">
            <img src="/images/M.png"/>
            {minesRemaining}
          </div>
          <div className="ui huge image label">
            <img src="/images/P0.png"/>
            {minesToFinish}
          </div>
          <div className="ui huge image label">
            <img src="/images/gameMode.png"/>
            {gameMode}
          </div>
        </div>
    )
  }

  renderTable() {
    let table = [];
    // Outer loop to create parent
    for (let i = 0; i < 16; i++) {
      let children = [];
      //Inner loop to create children
      for (let j = 0; j < 16; j++) {
        children.push(this.renderCell(i,j));
      }
      //Create the parent and add the children
      table.push(<tr>{children}</tr>);
    }
    return table
  }

  render() {
    console.log("Attempting to render")
    return (
      <div className="ui container">
        <GameHeader user={this.props.user}/>

        <button className="ui button blue" onClick={this.handleBackToGameList.bind(this)}>Back to Lobby</button>

        <div className="ui attached center aligned segment">
          {this.renderInfo()}
        </div>
        <div className="ui attached center aligned segment">
          {this.renderStatus()}
        </div>
        <div className="ui attached center aligned segment">
          <div className="ui grid">
              {this.renderPlayers()}
          </div>
        </div>
        <div className="ui attached segment">
          <table className="game-board">
            <tbody>
              {this.renderTable()}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

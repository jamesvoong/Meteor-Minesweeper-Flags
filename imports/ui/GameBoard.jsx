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
    }
  }

  handleBackToGameList() {
    this.props.backToGameListHandler();
  }

  renderCell(row, col) {
    let value = this.props.game.board[row][col];
    let LSR = this.props.game.lastSelected[0];
    let LSC = this.props.game.lastSelected[1];
    if (value === null && LSR == row && LSC == col) {
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
      status = `Current player: ${game.players[playerIndex].username}`;
    } else if (game.status === GameStatuses.FINISHED) {
      let playerIndex = game.winner();
      if (playerIndex === null) {
        status = "Finished: Tie";
      } else {
        status = `Finished: Winner: ${game.players[playerIndex].username}`;
      }
    }

    return (
      <div>{status}</div>
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

        <div className="ui top attached header">
          <div className="ui grid">
            <div className="ui two column center aligned row">
              <div className="ui column">
                {this.props.game.players[0].username} <br/> <img src="/images/P0.png" height="44" width="44"/> <br/>{this.props.game.scores[0]}
              </div>
              <div className="ui column">
                {this.props.game.players[1].username} <br/> <img src="/images/P1.png" height="44" width="44"/> <br/>{this.props.game.scores[1]}
              </div>
            </div>
          </div>
        </div>
        <div className="ui attached center aligned segment">
          {this.renderStatus()}
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

'use strict';
// libraries

// modules
const util = require('./util.js');
const game = require('./game.js');

// constants

// variables

// functions
let config;
let loggingUtil;

// initialization
// functions
const init = (_config, _loggingUtil, _bananojs) => {
  if (_config === undefined) {
    throw new Error('config is required.');
  }
  if (_loggingUtil === undefined) {
    throw new Error('loggingUtil is required.');
  }
  config = _config;
  loggingUtil = _loggingUtil;
};

const deactivate = () => {
  config = undefined;
  loggingUtil = undefined;
};

const getData = (sessionState, req, res) => {
  const ip = util.getIp(req);
  const sessionKey = util.getSessionKeyFromCookie(req, res);
  const data = {};
  if (sessionState[sessionKey] == undefined) {
    data.noAccount = true;
  } else {
    data.noAccount = false;
    data.account = sessionState[sessionKey].account;
  }
  data.depositAccount = game.getDepositAccount();

  const gameState = game.getCachedGameState();

  data.timer = gameState.timer;
  data.maxTimer = game.MAX_TIMER;
  data.gameStarted = gameState.gameStarted;
  data.lastWinners = gameState.lastWinners;
  data.pot = gameState.pot;
  data.currentPlayers = [];
  const getCurrentPlayers = (playerData0, account0, map0) => {
    const player = {};
    player.nickname = playerData0.nickname;
    player.bans = playerData0.bans;
    player.isPlayer = account0 == data.account;
    data.currentPlayers.push(player);
  };
  gameState.playersByAccount.forEach(getCurrentPlayers);

  data.currentPlayers.sort((player0, player1) => {
    if (player1.bans < player0.bans) {
      return -1;
    }
    if (player1.bans > player0.bans) {
      return 1;
    }
    return 0;
  });

  const numberOfPlayers = BigInt(gameState.playersByAccount.size);
  data.numberOfPlayers = numberOfPlayers;
  data.gameHasNoPlayers = numberOfPlayers == 0;

  if (data.account !== undefined) {
    if (gameState.playersByAccount.has(data.account)) {
      const player = gameState.playersByAccount.get(data.account);
      const nextMoveDepositBans = (player.nextBans - player.totalBansRemainder);
      let estimatedNextBans = player.nextBans;
      let estimatedWin = player.bans;
      let estimatedTimer = game.MAX_TIMER;
      while (estimatedTimer > game.ZERO) {
        estimatedWin += estimatedNextBans;
        estimatedNextBans += game.NEXT_BANS_BAN_INCREMENT;
        estimatedTimer -= game.NEXT_BANS_TIMER_DECREMENT;
      }
      const dividends = numberOfPlayers - game.ONE;
      const doubleDividends = dividends * game.TWO;
      const payToWinBans = estimatedWin;

      data.player = {};
      data.player.nextMoveMinBans = nextMoveDepositBans;
      data.player.payToWinBans = payToWinBans + dividends;
      data.player.bans = player.bans;
      data.player.nextBans = player.nextBans;
      data.player.totalBansRemainder = player.totalBansRemainder;
      data.player.moves = [];


      data.player.moves.push({label: 'Move Once, No Dividends', moveBans: nextMoveDepositBans});
      data.player.moves.push({label: 'Move Once, Full Dividends', moveBans: nextMoveDepositBans + dividends});
      data.player.moves.push({label: 'Move Once, Double Dividends', moveBans: nextMoveDepositBans + doubleDividends});
      data.player.moves.push({label: 'Pay To Win, Full Dividends', moveBans: payToWinBans + dividends});
      data.player.moves.push({label: 'Pay To Win, Double Dividends', moveBans: payToWinBans + doubleDividends});
    } else {
      data.player = {};
      data.player.payToWinBans = 'an unknown amount of';
      data.player.nextMoveMinBans = game.ONE;
      data.player.moves = [];
      data.player.moves.push({label: 'Move Once, No Dividends', moveBans: 1});
    }
  }
  return data;
};

exports.init = init;
exports.deactivate = deactivate;
exports.getData = getData;

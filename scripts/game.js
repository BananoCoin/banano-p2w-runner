'use strict';
// libraries
const bananojs = require('@bananocoin/bananojs');

// modules
const util = require('./util.js');

// constants
const MAX_TIMER = BigInt(20);
const NEXT_BANS_BAN_INCREMENT = BigInt(1);
const NEXT_BANS_TIMER_DECREMENT = BigInt(1);
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);

// variables
const gameState = {};
const cachedGameState = {};

// functions
let config;
let loggingUtil;
let depositAccount;

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

  depositAccount = bananojs.getAccountFromSeed(config.seed, 0);

  gameState.playersByAccount = new Map();
  gameState.winners = new Map();
  cachedGameState.playersByAccount = new Map();
  clearGameState();
  updateCachedGameState();
};

const deactivate = () => {
  config = undefined;
  loggingUtil = undefined;
  depositAccount = undefined;

  const keys = [...Object.keys(gameState)];
  keys.forEach((key) => {
    delete gameState[key];
  });
};


const clearGameState = () => {
  gameState.gameStarted = true;
  gameState.gameFinished = false;
  gameState.gameReset = false;
  gameState.timer = MAX_TIMER;
  gameState.pot = ZERO;
  gameState.playersByAccount.clear();
  gameState.winners.clear();
};

const updateCachedGameState = () => {
  cachedGameState.gameStarted = gameState.gameStarted;
  cachedGameState.gameFinished = gameState.gameFinished;
  cachedGameState.gameReset = gameState.gameReset;
  cachedGameState.timer = gameState.timer;
  cachedGameState.pot = gameState.pot;
  cachedGameState.playersByAccount.clear();

  gameState.playersByAccount.forEach((player, account) => {
    const newPlayer = {};
    newPlayer.nickname = player.nickname;
    newPlayer.nextBans = player.nextBans;
    newPlayer.bans = player.bans;
    newPlayer.totalBansRemainder = player.totalBansRemainder;
    newPlayer.totalBansSpent = player.totalBansSpent;
    cachedGameState.playersByAccount.set(account, newPlayer);
  });
};


const resetPlayerDataForNewGame = (playerData) => {
  playerData.bans= ZERO;
  playerData.nextBans = ONE;
};

const getPlayerData = (account) => {
  if (!gameState.playersByAccount.has(account)) {
    const newPlayer = {};
    newPlayer.nickname = util.getShortenedAccount(account);
    newPlayer.totalBansRemainder = ZERO;
    newPlayer.totalBansSpent = ZERO;
    newPlayer.deposits = new Set();

    resetPlayerDataForNewGame(newPlayer);
    gameState.playersByAccount.set(account, newPlayer);
  }
  const playerData = gameState.playersByAccount.get(account);
  return playerData;
};

const updateGame = async (history) => {
  return new Promise((resolve) => {
    history.forEach((historyElt) => {
      loggingUtil.debug('updateGame', 'STARTED', historyElt);

      if (historyElt.subtype == 'change') {
        const representative = historyElt.representative;
        loggingUtil.log('updateGame', 'STARTED', historyElt.type, historyElt.subtype, representative);
        gameState.gameReset = true;
        loggingUtil.log('updateGame', 'SUCCESS', historyElt.type, historyElt.subtype, representative);
      } else {
        const account = historyElt.account;
        const amountRaw = historyElt.amount;
        const bananoParts = bananojs.getBananoPartsFromRaw(amountRaw);
        const bananoAmount = BigInt(bananoParts.banano);
        const playerData = getPlayerData(account);

        loggingUtil.debug('updateGame', 'STARTED', historyElt.type, historyElt.subtype, account, bananoAmount);
        if (historyElt.subtype == 'send') {
          if (gameState.gameFinished) {
            if (gameState.winners.has(account)) {
              const winner = gameState.winners.get(account);
              winner.paidBans += bananoAmount;
              winner.unpaidBans -= bananoAmount;
            }
          }
        }
        if (historyElt.subtype == 'receive') {
          if (!playerData.deposits.has(historyElt.hash)) {
            playerData.deposits.add(historyElt.hash);

            playerData.totalBansRemainder += bananoAmount;

            if (gameState.gameFinished) {
              loggingUtil.log('deposit after game was won');
            } else {
              loggingUtil.debug(util.getDate(), 'loadHistory', playerData.nickname,
                  'loaded', bananoAmount, 'bans for a total of',
                  playerData.totalBansRemainder, '.'
              );

              if (playerData.totalBansRemainder < playerData.nextBans) {
                loggingUtil.debug(util.getDate(), 'loadHistory', playerData.nickname,
                    'cannot move as he requires', playerData.nextBans, 'to move.'
                );
              }

              while (playerData.totalBansRemainder >= playerData.nextBans) {
                // loggingUtil.debug(util.getDate(), 'loadHistory', playerData.nickname,
                //     'playerData.totalBansRemainder', playerData.totalBansRemainder,
                //     'playerData.nextBans', playerData.nextBans
                // );
                loggingUtil.debug(util.getDate(), 'loadHistory', playerData.nickname,
                    'has a total of', playerData.totalBansRemainder,
                    'bans and can move as he requires',
                    playerData.nextBans, 'to move.'
                );

                const addDividends = (playerData0, account0, map0) => {
                  // loggingUtil.debug('addDividends', playerData0, account0);
                  if (playerData0.bans < playerData.bans) {
                    if (playerData.totalBansRemainder > ZERO) {
                      playerData.totalBansRemainder --;
                      playerData.totalBansSpent ++;
                      playerData0.bans++;
                      loggingUtil.debug(util.getDate(), 'loadHistory',
                          'dividend', playerData0.nickname, playerData0.bans,
                          'remainder', playerData.nickname, playerData.totalBansRemainder);
                    } else {
                      loggingUtil.debug(util.getDate(), 'loadHistory', 'no dividend, no money',
                          playerData0.nickname);
                    }
                  } else {
                    loggingUtil.debug(util.getDate(), 'loadHistory', 'no dividend, playerData0.bans >= playerData.bans',
                        playerData0.nickname, playerData0.bans, '>=', playerData.nickname, playerData.bans);
                  }
                };

                // loggingUtil.debug('add dividends to ', gameState.playersByAccount);
                gameState.playersByAccount.forEach(addDividends);
                if (playerData.totalBansRemainder > ZERO) {
                  playerData.totalBansRemainder --;
                  playerData.totalBansSpent++;
                  gameState.pot++;
                }

                if (playerData.totalBansRemainder >= playerData.nextBans) {
                  playerData.totalBansRemainder -= playerData.nextBans;
                  playerData.totalBansSpent += playerData.nextBans;
                  playerData.bans += playerData.nextBans;
                  playerData.nextBans += NEXT_BANS_BAN_INCREMENT;
                  if (gameState.timer > ZERO) {
                    gameState.timer -= NEXT_BANS_TIMER_DECREMENT;
                  }
                }

                loggingUtil.debug(util.getDate(), 'loadHistory playersByAccount.size', gameState.playersByAccount.size);
                loggingUtil.debug(util.getDate(), 'loadHistory pot', gameState.pot, 'timer', gameState.timer);

                // loggingUtil.debug(util.getDate(), 'loadHistory', 'totalBansRemainder',
                // playerData.nickname, playerData.totalBansRemainder);

                if (gameState.timer == ZERO) {
                  gameState.gameFinished = true;

                  let winner0 = undefined;
                  const getWinners = (playerData0, account0, map0) => {
                    const winner = {};
                    winner.account = account0;
                    winner.nickname = playerData0.nickname;
                    winner.bans = playerData0.bans;
                    winner.unusedBans = playerData0.totalBansRemainder;
                    winner.pot = ZERO;
                    winner.paidBans = ZERO;
                    winner.unpaidBans = ZERO;
                    winner.unpaidBans += winner.bans;
                    winner.unpaidBans += winner.unusedBans;

                    if ((winner0 == undefined) || (winner0.bans < playerData0.bans)) {
                      loggingUtil.debug('changing winner0 to ', winner);
                      winner0 = winner;
                    } else {
                      loggingUtil.debug('not changing winner0 to ', winner);
                    }

                    gameState.winners.set(account0, winner);
                  };
                  gameState.playersByAccount.forEach(getWinners);

                  loggingUtil.debug('winner0 is ', winner0);

                  if (winner0 != undefined) {
                    loggingUtil.debug('changing winner0.pot to ', gameState.pot);
                    winner0.pot = gameState.pot;
                    winner0.unpaidBans += winner0.pot;
                  }
                }
              }
            }
          }
        }
        loggingUtil.debug('updateGame', 'SUCCESS', historyElt.type, historyElt.subtype, account, bananoAmount);
      }
    });
    if (gameState.gameFinished) {
      const resetGameAndResolve = () => {
        if (gameState.gameReset) {
          loggingUtil.log(util.getDate(), 'end game already sent');
          updateCachedGameState();
          resolve();
        } else {
          loggingUtil.log(util.getDate(), 'change block end game');
          addChangeBlockToEndGame()
              .then((response) => {
                loggingUtil.log(util.getDate(), 'respond change block end game', response);
                updateCachedGameState();
                resolve();
              });
        }
      };
      const winners = [...gameState.winners.values()];
      let checkedWinner = 0;
      const checkWinner = () => {
        if (checkedWinner < winners.length) {
          const winner = winners[checkedWinner];
          loggingUtil.debug(util.getDate(), 'checkWinner', checkedWinner, winners.length, winner);
          if (winner.unpaidBans > ZERO) {
            loggingUtil.log(util.getDate(), 'unpaid winner', winner);
            sendWinnings(winner).then((response) => {
              loggingUtil.log(util.getDate(), 'respond paying winner', winner, response);
              checkedWinner++;
              checkWinner();
            });
          } else {
            checkedWinner++;
            checkWinner();
          }
        } else {
          resetGameAndResolve();
        }
      };
      checkWinner();
    } else {
      loggingUtil.debug('updateGame', 'resolve');
      updateCachedGameState();
      resolve();
    }
  });
};

const checkPendingAndStartGame = async () => {
  return new Promise((resolve) => {
    bananojs.receiveDepositsForSeed(config.seed, 0, config.representative)
        .catch((error) => {
          loggingUtil.log(util.getDate(), 'checkPendingAndStartGame failure.', error);
        })
        .then(async (response) => {
          loggingUtil.debug(util.getDate(), 'checkPending', response);
          updateCachedGameState();
          clearGameState();
          bananojs.getAccountHistory(depositAccount, -1, undefined, true).then(async (history) => {
            loggingUtil.debug(util.getDate(), 'getAccountHistory', history);
            if (history.history != undefined) {
              const reversedAndTruncatedHistory = [];
              let foundChange = false;
              for (let historyIx = 0; (historyIx < history.history.length) && (!foundChange); historyIx++) {
                const historyElt = history.history[historyIx];
                if (historyElt.subtype == 'change') {
                  foundChange = true;
                } else {
                  reversedAndTruncatedHistory.unshift(historyElt);
                }
              }

              updateGame(reversedAndTruncatedHistory).then(async () => {
                loggingUtil.log(util.getDate(), 'checkPendingAndStartGame success.');
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
  });
};

const addChangeBlockToEndGame = async () => {
  return new Promise((resolve) => {
    const nonce = util.getRandomHex32();
    const callback = async (hash) => {
      if (hash === undefined) {
        const response = {};
        response.success = false;
        response.message = `failure ${nonce} undefined hash.`;
        resolve(response);
      } else {
        const response = {};
        response.success = true;
        response.message = `success ${nonce} https://creeper.banano.cc/explorer/block/${hash}`;
        resolve(response);
      }
    };

    const errorCallback = async (error) => {
      loggingUtil.trace(util.getDate(), `${nonce} FAILURE bananojs.changeRepresentativeForSeed`, error);
      let errorMessage = error.toString();
      if (error.error !== undefined) {
        errorMessage = error.error;
      }
      if (error.message !== undefined) {
        errorMessage = error.message;
      }
      const message= `${nonce} error on send, Error was '${errorMessage}.'`;
      const response = {};
      response.success = false;
      response.message = message;
      resolve(response);
    };
    const serverWalletSeed = config.seed;
    const representative = config.representative;
    bananojs.changeRepresentativeForSeed(serverWalletSeed, 0, representative)
        .catch(errorCallback)
        .then(callback);
  });
};

const sendWinnings = async (winner) => {
  return new Promise((resolve) => {
    const nonce = util.getRandomHex32();
    const unpaidBans = winner.unpaidBans;
    const account = winner.account;
    const callback = async (hash) => {
      if (hash === undefined) {
        winner.unpaidBans = unpaidBans;

        const response = {};
        response.success = false;
        response.message = `failure ${account} ${nonce} undefined hash, reset unpaidBans to ${unpaidBans}`;
        resolve(response);
      } else {
        winner.paidBans += unpaidBans;
        winner.unpaidBans = ZERO;

        const response = {};
        response.success = true;
        response.message = `success ${account} ${nonce} https://creeper.banano.cc/explorer/block/${hash}`;
        resolve(response);
      }
    };

    const errorCallback = async (error) => {
      loggingUtil.trace(util.getDate(), `${nonce} FAILURE bananoUtil.send`, error);
      let errorMessage = error.toString();
      if (error.error !== undefined) {
        errorMessage = error.error;
      }
      if (error.message !== undefined) {
        errorMessage = error.message;
      }
      let message;
      if (errorMessage == 'Old block') {
        message = `${nonce} error on send, Error was '${errorMessage}, withdrawPending not reset.'`;
      } else if (errorMessage == 'Gap source block') {
        message = `${nonce} error on send, Error was '${errorMessage}, withdrawPending not reset.'`;
      } else {
        message = `${nonce} error on send, reset unpaidBans to ${unpaidBans}, Error was '${errorMessage}'`;
        winner.unpaidBans = unpaidBans;
      }
      const response = {};
      response.success = false;
      response.message = message;
      resolve(response);
    };
    const serverWalletSeed = config.seed;
    const toAddress = account;
    const amountBanoshiStr = Math.trunc(parseFloat(unpaidBans) * 100).toString();
    const amountRaw = bananojs.getRawStrFromBanoshiStr(amountBanoshiStr);
    bananojs.sendAmountToAccount(serverWalletSeed, 0, toAddress, amountRaw,
        callback, errorCallback)
        .catch(errorCallback)
        .then(callback);
  });
};

const getCachedGameState = () => {
  return cachedGameState;
};

const getDepositAccount = () => {
  return depositAccount;
};

exports.init = init;
exports.deactivate = deactivate;
exports.checkPendingAndStartGame = checkPendingAndStartGame;
exports.getCachedGameState = getCachedGameState;
exports.getDepositAccount = getDepositAccount;
exports.MAX_TIMER = MAX_TIMER;
exports.NEXT_BANS_BAN_INCREMENT = NEXT_BANS_BAN_INCREMENT;
exports.NEXT_BANS_TIMER_DECREMENT = NEXT_BANS_TIMER_DECREMENT;
exports.ZERO = ZERO;
exports.ONE = ONE;
exports.TWO = TWO;

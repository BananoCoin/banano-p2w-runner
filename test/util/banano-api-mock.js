'use strict';

const histories = {};

const accountInfos = {};

const deactivate = () => {
  Object.keys(histories).forEach((key) => {
    delete histories[key];
  });
  Object.keys(accountInfos).forEach((key) => {
    delete accountInfos[key];
  });
};

const setAccountInfo = (_account, _accountInfo) => {
  if (_account === undefined) {
    throw new Error('account is required.');
  }
  if (_accountInfo === undefined) {
    throw new Error('accountInfo is required.');
  }
  accountInfos[_account] = _accountInfo;
};

const setAccountHistory = (_account, _max, _hash, _history) => {
  if (_account === undefined) {
    throw new Error('account is required.');
  }
  if (_max === undefined) {
    throw new Error('max is required.');
  }
  // if (_hash === undefined) {
  // throw new Error('hash is required.');
  // }
  if (_history === undefined) {
    throw new Error('history is required.');
  }
  if (histories[_account] === undefined) {
    histories[_account] = {};
  }
  if (histories[_account][_max] === undefined) {
    histories[_account][_max] = {};
  }
  histories[_account][_max][_hash] = _history;
  // console.log('setAccountHistory', histories);
};

const getAccountHistory = async (account, max, hash) => {
  const history = {};
  if (histories[account] == undefined) {
    history.history = undefined;
    // console.log('getAccountHistory1', account, max, hash, history);
  } else {
    if (histories[account][max] === undefined) {
      history.history = undefined;
      // console.log('getAccountHistory2', account, max, hash, history);
    } else {
      if (histories[account][max][hash] === undefined) {
        history.history = undefined;
        // console.log('getAccountHistory3', account, max, hash, history);
      } else {
        history.history = histories[account][max][hash];
        // console.log('getAccountHistory4', account, max, hash, history);
      }
    }
  }
  // console.log('getAccountHistory', account, max, hash, history);
  return history;
};

const getGeneratedWork = async () => {
  return '';
};

const getAccountRepresentative = async () => {
  return '';
};

const process = async () => {
  return '';
};

const getAccountInfo = async (account) => {
  const accountInfo = accountInfos[account];
  return accountInfo;
};

const getAccountsPending = async (accounts, max) => {
  const pending = {};
  pending.blocks = {};
  accounts.forEach((account) => {
    pending.blocks[account] = [];
  });
  return pending;
};

exports.deactivate = deactivate;
exports.setAccountHistory = setAccountHistory;
exports.getAccountsPending = getAccountsPending;
exports.getAccountHistory = getAccountHistory;
exports.getAccountInfo = getAccountInfo;
exports.setAccountInfo = setAccountInfo;
exports.getGeneratedWork = getGeneratedWork;
exports.getAccountRepresentative = getAccountRepresentative;
exports.process = process;

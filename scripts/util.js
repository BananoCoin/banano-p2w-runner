'use strict';
// libraries
const crypto = require('crypto');
const blake = require('blakejs');

// modules
const util = require('./util.js');

// constants

// variables

// functions
let config;
let loggingUtil;

// initialization
// functions
const init = (_config, _loggingUtil) => {
  if (_config === undefined) {
    throw new Error('config is required.');
  }
  if (_loggingUtil === undefined) {
    throw new Error('loggingUtil is required.');
  }
  config = _config;
  loggingUtil = _loggingUtil;

  checkConfig();
};

const deactivate = () => {
  config = undefined;
  loggingUtil = undefined;
};

const checkConfig = () => {
  if (config.port == undefined) {
    throw Error('port in config.json does not exist.');
  }

  if (config.checkPendingTimerMs == undefined) {
    throw Error('checkPendingTimerMs in config.json does not exist.');
  }

  if (config.representative == undefined) {
    throw Error('representative in config.json does not exist.');
  }

  if (config.seed == undefined) {
    throw Error('seed in config.json does not exist. Use something like ' +
        `"seed":"${util.getRandomHex32()}"`);
  }

  if (config.cookieSecret == undefined) {
    throw Error('cookieSecret in config.json does not exist. Use something like ' +
      `"cookieSecret":"${util.getRandomHex32()}"`);
  }
};

const getRandomHex32 = () => {
  return crypto.randomBytes(32).toString('hex').toUpperCase();
};

const getShortenedAccount = (account) => {
  if (account == undefined) {
    throw new Error('account is required.');
  }
  if (account.substring == undefined) {
    loggingUtil.log(account);
    throw new Error('account is required to be a string.');
  }
  // console.log('STARTED getShortAccount', account);
  let retval;
  /* istanbul ignore else */
  if (account !== undefined) {
    const prefix = account.substring(0, 9).toUpperCase();
    const suffix = account.substring(account.length - 5).toUpperCase();
    retval = prefix + '...' + suffix;
  }
  // console.log('SUCCESS getShortAccount', retval);
  return retval;
};

const getDate = () => {
  return new Date().toISOString();
};

const setSessionKeyInCookie = (req, res, sessionKey) => {
  req.signedCookies.sessionKey = sessionKey;
  if (res !== undefined) {
    res.cookie('sessionKey', req.signedCookies.sessionKey, {signed: true});
  }
};

const getNewSessionKey = () => {
  return getRandomHex32();
};

const getSessionKeyFromCookie = (req, res) => {
  let badSessionKey = false;
  if (req.signedCookies.sessionKey === undefined) {
    badSessionKey = true;
  } else if (req.signedCookies.sessionKey.substring == undefined) {
    const ip = getIp(req);
    loggingUtil.log('getSessionKeyFromCookie bad sessionKey',
        req.signedCookies.sessionKey, 'ip', ip);
    badSessionKey = true;
  }
  if (badSessionKey) {
    const sessionKey = getNewSessionKey();
    setSessionKeyInCookie(req, res, sessionKey);
  }
  const sessionKey = req.signedCookies.sessionKey;
  return sessionKey;
};

const getBlake2HashOfArray = (array) => {
  // console.log('STARTED getBlake2HashOfArray', array);
  const context = blake.blake2bInit(32, null);
  array.forEach((value) => {
    blake.blake2bUpdate(context, value);
  });
  const hashBytes = blake.blake2bFinal(context);

  const hash = Buffer.from(hashBytes).toString('hex').toUpperCase();
  // console.log('SUCCESS getBlake2HashOfArray', hash);
  return hash;
};

const getIp = (req) => {
  let ip;
  if (req.headers['x-forwarded-for'] !== undefined) {
    ip = req.headers['x-forwarded-for'];
  } else if (req.connection.remoteAddress == '::ffff:127.0.0.1') {
    ip = '::ffff:127.0.0.1';
  } else if (req.connection.remoteAddress == '::1') {
    ip = '::ffff:127.0.0.1';
  } else {
    ip = req.connection.remoteAddress;
  }
  // console.log('ip', ip);
  return ip;
};

exports.init = init;
exports.deactivate = deactivate;
exports.getRandomHex32 = getRandomHex32;
exports.getShortenedAccount = getShortenedAccount;
exports.getDate = getDate;
exports.getNewSessionKey = getNewSessionKey;
exports.getSessionKeyFromCookie = getSessionKeyFromCookie;
exports.getBlake2HashOfArray = getBlake2HashOfArray;
exports.getIp = getIp;

'use strict';
// libraries
const chai = require('chai');

// modules
const testConfig = require('../test-config.json');
const util = require('../../scripts/util.js');
const testUtil = require('../util/test-util.js');
const expect = chai.expect;

// constants

// variables
const loggingUtilLogOff = {};

// initialization
loggingUtilLogOff.log = () => {};
loggingUtilLogOff.debug = () => {};
loggingUtilLogOff.trace = console.trace;

// functions

describe('util', () => {
  describe('init errors', () => {
    it('init errors', async () => {
      const fn = util.init;
      const testConfigPartial = {};
      await testUtil.expectErrorMessage('config is required.', fn);
      await testUtil.expectErrorMessage('loggingUtil is required.', fn, testConfigPartial);
      await testUtil.expectErrorMessage('port in config.json does not exist.',
          fn, testConfigPartial, loggingUtilLogOff);
      testConfigPartial.port = testConfig.port;
      await testUtil.expectErrorMessage('checkPendingTimerMs in config.json does not exist.',
          fn, testConfigPartial, loggingUtilLogOff);
      testConfigPartial.checkPendingTimerMs = testConfig.checkPendingTimerMs;
      await testUtil.expectErrorMessage('representative in config.json does not exist.',
          fn, testConfigPartial, loggingUtilLogOff);
      testConfigPartial.representative = testConfig.representative;
      await testUtil.expectErrorMessageRegex('seed in config.json does not exist.  Use something like "seed":".*?"',
          fn, testConfigPartial, loggingUtilLogOff);
      testConfigPartial.seed = testConfig.seed;
      await testUtil.expectErrorMessageRegex('cookieSecret in config.json does not exist.  Use something like "seed":".*?"',
          fn, testConfigPartial, loggingUtilLogOff);
      testConfigPartial.cookieSecret = testConfig.cookieSecret;
      fn(testConfigPartial, loggingUtilLogOff);
    });
  });

  describe('getNewSessionKey', () => {
    it('getNewSessionKey', async () => {
      const sessionKey = util.getNewSessionKey();
      expect(sessionKey.length).to.equal(64);
    });
  });

  describe('getIp', () => {
    it('getIp', async () => {
      const req = {};
      req.headers = {};
      req.connection = {};
      const ip = util.getIp(req);
    });
    it('getIp ::1', async () => {
      const req = {};
      req.headers = {};
      req.connection = {};
      req.connection.remoteAddress = '::1';
      const ip = util.getIp(req);
    });
    it('getIp ::1', async () => {
      const req = {};
      req.headers = {};
      req.connection = {};
      req.connection.remoteAddress = '::ffff:127.0.0.1';
      const ip = util.getIp(req);
    });
    it('getIp x-forwarded-for', async () => {
      const req = {};
      req.headers = {};
      req.headers['x-forwarded-for'] = '::1';
      req.connection = {};
      req.connection.remoteAddress = '::ffff:127.0.0.1';
      const ip = util.getIp(req);
    });
  });

  describe('getBlake2HashOfArray', () => {
    it('getBlake2HashOfArray', async () => {
      const hash = util.getBlake2HashOfArray(['']);
      expect(hash.length).to.equal(64);
    });
  });

  describe('getSessionKeyFromCookie', () => {
    it('getSessionKeyFromCookie', async () => {
      const req = {};
      req.signedCookies = {};
      const res = {};
      res.cookie = () => {};
      const hash = util.getSessionKeyFromCookie(req, res);
      expect(hash.length).to.equal(64);
    });
    it('getSessionKeyFromCookie no res', async () => {
      const req = {};
      req.signedCookies = {};
      const res = undefined;
      const hash = util.getSessionKeyFromCookie(req, res);
      expect(hash.length).to.equal(64);
    });
    it('getSessionKeyFromCookie non string sessionKey', async () => {
      util.init(testConfig, loggingUtilLogOff);
      const req = {};
      req.headers = {};
      req.connection = {};
      req.signedCookies = {};
      req.signedCookies.sessionKey = {};
      const res = {};
      res.cookie = () => {};
      const hash = util.getSessionKeyFromCookie(req, res);
      expect(hash.length).to.equal(64);
    });
  });

  describe('getDate', () => {
    it('getDate', async () => {
      const date = util.getDate();
      expect(date.length).to.equal(24);
    });
  });

  describe('getShortenedAccount', () => {
    it('getShortenedAccount', async () => {
      const shortenedAccount = util.getShortenedAccount('ban_1towin9fujcw39s4src6q5jsxgzxrdxfi8gykunhjgowpxrp1uytay5mjwqc');
      expect(shortenedAccount).to.equal('BAN_1TOWI...MJWQC');
    });
    it('getShortenedAccount non string sessionKey', async () => {
      util.init(testConfig, loggingUtilLogOff);
      const fn = util.getShortenedAccount;
      await testUtil.expectErrorMessage('account is required to be a string.', fn, {});
    });
    it('getShortenedAccount undefined', async () => {
      util.init(testConfig, loggingUtilLogOff);
      const fn = util.getShortenedAccount;
      await testUtil.expectErrorMessage('account is required.', fn);
    });
  });

  describe('stringify', () => {
    it('Map instanceof', async () => {
      expect(new Map() instanceof Map).to.equal(true);
    });
    it('Set instanceof', async () => {
      expect(new Set() instanceof Set).to.equal(true);
    });
    it('Set string', async () => {
      const set = new Set();
      set.add('a');
      set.add('b');
      set.add('c');
      const expectedValue = testUtil.stringify(['a', 'b', 'c']);
      const actualValue = testUtil.stringify(set);
      expect(expectedValue).to.deep.equal(actualValue);
    });
    it('Map string', async () => {
      const map = new Map();
      map.set('a', '1');
      map.set('b', '2');
      map.set('c', '3');
      const expectedValue = testUtil.stringify({'a': '1', 'b': '2', 'c': '3'});
      const actualValue = testUtil.stringify(map);
      expect(expectedValue).to.deep.equal(actualValue);
    });
  });

  beforeEach(async () => {
  });


  afterEach(async () => {
    util.deactivate();
  });
});

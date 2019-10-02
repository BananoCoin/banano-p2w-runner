'use strict';
// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const testConfig = require('../test-config.json');
const game = require('../../scripts/game.js');
const util = require('../../scripts/util.js');
const home = require('../../scripts/home.js');
const testUtil = require('../util/test-util.js');
const bananodeApi = require('../util/banano-api-mock.js');
const expect = chai.expect;

// constants

// variables
const loggingUtilLogOff = {};
const discordApi = {};

// initialization
loggingUtilLogOff.log = () => {};
// loggingUtilLogOff.log = console.log;
loggingUtilLogOff.debug = () => {};
// loggingUtilLogOff.debug = console.log;
loggingUtilLogOff.trace = console.trace;

// functions
const expectDataFromHistoryToMatchExpected = async (playerAccount, accountHistory, expectedData) => {
  if (accountHistory !== undefined) {
    const historyAccount = 'ban_393kiuodwjbk9aqfu4sc9sa3rc8foix4kaajyqf41jo4rd7cnne7rj54hmk3';
    bananodeApi.setAccountHistory(historyAccount, -1, undefined, accountHistory);
  }
  bananojs.setBananodeApi(bananodeApi);
  util.init(testConfig, loggingUtilLogOff);
  game.init(testConfig, loggingUtilLogOff);
  home.init(testConfig, loggingUtilLogOff);
  if (accountHistory !== undefined) {
    await game.checkPendingAndStartGame();
  }
  const expectedDataStr = testUtil.stringify(expectedData);
  const req = {};
  req.headers = {};
  req.connection = {};
  req.signedCookies = {};
  const res = {};
  res.cookie = () => {};
  const sessionState = {};
  if (playerAccount !== undefined) {
    const sessionKey = util.getSessionKeyFromCookie(req, res);
    sessionState[sessionKey] = {};
    sessionState[sessionKey].account = playerAccount;
  }
  const actualData = home.getData(sessionState, req, res);
  const actualDataStr = testUtil.stringify(actualData);
  // console.log('actualData', actualData);
  expect(actualDataStr).to.deep.equal(expectedDataStr);
};

describe('home', () => {
  describe('init errors', () => {
    it('init errors', async () => {
      const fn = home.init;
      await testUtil.expectErrorMessage('config is required.', fn);
      await testUtil.expectErrorMessage('loggingUtil is required.', fn, testConfig);
      fn(testConfig, loggingUtilLogOff);
    });
  });

  describe('getData', () => {
    it('getData no account, no history', async () => {
      const expectedData = {
        'noAccount': true,
      	'depositAccount': 'ban_393kiuodwjbk9aqfu4sc9sa3rc8foix4kaajyqf41jo4rd7cnne7rj54hmk3',
      	'timer': '0',
      	'gameStarted': false,
      	'pot': '0',
        'currentPlayers': [],
        'numberOfPlayers': '0',
      };
      const account = undefined;
      const accountHistory = undefined;
      await expectDataFromHistoryToMatchExpected(account, accountHistory, expectedData);
    });
    it('getData no account, 0 history', async () => {
      const expectedData = {
        'noAccount': true,
        	'depositAccount': 'ban_393kiuodwjbk9aqfu4sc9sa3rc8foix4kaajyqf41jo4rd7cnne7rj54hmk3',
        	'timer': '20',
        	'gameStarted': true,
        	'pot': '0',
        	'currentPlayers': [],
        	'numberOfPlayers': '0',
      };
      const account = undefined;
      const accountHistory = [];
      await expectDataFromHistoryToMatchExpected(account, accountHistory, expectedData);
    });
    it('getData bad account, 0 history', async () => {
      const expectedData = {
        'noAccount': false,
      	'account': 'ban_1bananobh5rat99qfgt1ptpieie5swmoth87thi74qgbfrij7dcgjiij94xr',
    	  'depositAccount': 'ban_393kiuodwjbk9aqfu4sc9sa3rc8foix4kaajyqf41jo4rd7cnne7rj54hmk3',
      	'timer': '20',
      	'gameStarted': true,
      	'pot': '0',
      	'currentPlayers': [],
      	'numberOfPlayers': '0',
      };
      const account = testUtil.ACCOUNT_GENESIS;
      const accountHistory = [];
      await expectDataFromHistoryToMatchExpected(account, accountHistory, expectedData);
    });
    it('getData 1 history', async () => {
      const expectedData = {
        'noAccount': false,
      	'account': 'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
      	'depositAccount': 'ban_393kiuodwjbk9aqfu4sc9sa3rc8foix4kaajyqf41jo4rd7cnne7rj54hmk3',
      	'timer': '19',
      	'gameStarted': true,
      	'pot': '1',
      	'currentPlayers': [
          {
      			'nickname': 'BAN_1CORA...OCDXA',
      			'bans': '1',
            'isPlayer': true,
      		},
        ],
        'numberOfPlayers': '1',
        'player': {
        	'nextMoveMinBans': '2',
      		'payToWinBans': '1',
      		'bans': '1',
      		'nextBans': '2',
      		'totalBansRemainder': '0',
          'moves': [
      			{
      				'label': 'Move Once, No Dividends',
      				'moveBans': '2',
      			},
      			{
      				'label': 'Move Once, Full Dividends',
      				'moveBans': '2',
      			},
      			{
      				'label': 'Move Once, Double Dividends',
      				'moveBans': '2',
      			},
      			{
      				'label': 'Pay To Win, Full Dividends',
      				'moveBans': '1',
      			},
      			{
      				'label': 'Pay To Win, Double Dividends',
      				'moveBans': '1',
      			},
      		],
      	},
      };
      const account = testUtil.ACCOUNT_CORANOS;
      const accountHistory = require('../data/account-history-000.json').history.slice(0, 1);
      await expectDataFromHistoryToMatchExpected(account, accountHistory, expectedData);
    });
  });

  beforeEach(async () => {
  });

  afterEach(async () => {
    bananodeApi.deactivate();
    home.deactivate();
    game.deactivate();
    util.deactivate();
  });
});

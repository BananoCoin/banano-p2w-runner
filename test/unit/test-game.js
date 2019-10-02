'use strict';
// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const testConfig = require('../test-config.json');
const game = require('../../scripts/game.js');
const util = require('../../scripts/util.js');
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
const expectGameStateFromHistoryToMatchExpected = async (bananodeApiData, expectedGameState) => {
  const account = 'ban_393kiuodwjbk9aqfu4sc9sa3rc8foix4kaajyqf41jo4rd7cnne7rj54hmk3';
  if (bananodeApiData.accountHistory !== undefined) {
    bananodeApi.setAccountHistory(account, -1, undefined, bananodeApiData.accountHistory);
  }
  if (bananodeApiData.accountInfo !== undefined) {
    bananodeApi.setAccountInfo(account, bananodeApiData.accountInfo);
  }

  bananojs.setBananodeApi(bananodeApi);
  game.init(testConfig, loggingUtilLogOff);
  // console.log('expectGameStateFromHistoryToMatchExpected', 'checkPendingAndStartGame', 'started');
  await game.checkPendingAndStartGame();
  // console.log('expectGameStateFromHistoryToMatchExpected', 'checkPendingAndStartGame', 'success');
  const actualGameState = game.getGameState();
  const actualGameStateStr = testUtil.stringify(actualGameState);
  // console.log('actualGameState', actualGameState);
  // console.log('actualGameStateStr', actualGameStateStr);
  const expectedGameStateStr = testUtil.stringify(expectedGameState);
  expect(actualGameStateStr).to.equal(expectedGameStateStr);
};

describe('game', () => {
  describe('init errors', () => {
    it('init errors', async () => {
      util.init(testConfig, loggingUtilLogOff);
      const fn = game.init;
      await testUtil.expectErrorMessage('config is required.', fn);
      await testUtil.expectErrorMessage('loggingUtil is required.', fn, testConfig);
      fn(testConfig, loggingUtilLogOff);
    });
  });

  describe('checkPendingAndStartGame', () => {
    it('checkPendingAndStartGame no history', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = false;
      expectedGameState.gameReset = false;
      expectedGameState.timer = game.MAX_TIMER;
      expectedGameState.pot = game.ZERO;
      expectedGameState.playersByAccount = new Map();
      expectedGameState.winners = {};
      const bananodeApiData = {};
      bananodeApiData.accountHistory = [];
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.balance = '0';
      bananodeApiData.accountInfo.frontier = '';
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });
    it('checkPendingAndStartGame undefined history', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = false;
      expectedGameState.gameReset = false;
      expectedGameState.timer = game.MAX_TIMER;
      expectedGameState.pot = game.ZERO;
      expectedGameState.playersByAccount = new Map();
      expectedGameState.winners = {};
      const bananodeApiData = {};
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });
    it('checkPendingAndStartGame one deposit', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = false;
      expectedGameState.gameReset = false;
      expectedGameState.timer = game.MAX_TIMER - game.ONE;
      expectedGameState.pot = game.ONE;
      expectedGameState.playersByAccount = new Map();
      const accountCoranosJson = {
        'nickname': 'BAN_1CORA...OCDXA',
        'totalBansRemainder': '0',
        'totalBansSpent': '2',
        'deposits': [
          '11C4A9F4C89C452C2B5025E07D20C0FE2E0A983B234786D36C7545E2A4379FE1',
        ],
        'bans': '1',
        'nextBans': '2',
      };
      expectedGameState.playersByAccount.set(testUtil.ACCOUNT_CORANOS, accountCoranosJson);
      expectedGameState.winners = {};
      util.init(testConfig, loggingUtilLogOff);
      const accountHistory = require('../data/account-history-000.json').history.slice(0, 1).reverse();
      const bananodeApiData = {};
      bananodeApiData.accountHistory = accountHistory;
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.balance = '0';
      bananodeApiData.accountInfo.frontier = '';
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });
    it('checkPendingAndStartGame two deposit', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = false;
      expectedGameState.gameReset = false;
      expectedGameState.timer = game.MAX_TIMER - game.ONE;
      expectedGameState.pot = game.ONE;
      expectedGameState.playersByAccount = new Map();
      const accountCoranosJson = {
        'nickname': 'BAN_1CORA...OCDXA',
        'totalBansRemainder': '1',
        'totalBansSpent': '2',
        'deposits': [
          '11C4A9F4C89C452C2B5025E07D20C0FE2E0A983B234786D36C7545E2A4379FE1',
          'A83879E4D14E5D2F2CE4B3D8AE1D01B7684E6DE4E38587B14DB665A5AF4DF95F',
        ],
        'bans': '1',
        'nextBans': '2',
      };
      expectedGameState.playersByAccount.set(testUtil.ACCOUNT_CORANOS, accountCoranosJson);
      expectedGameState.winners = {};
      util.init(testConfig, loggingUtilLogOff);
      const accountHistory = require('../data/account-history-000.json').history.slice(0, 2).reverse();
      const bananodeApiData = {};
      bananodeApiData.accountHistory = accountHistory;
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.balance = '0';
      bananodeApiData.accountInfo.frontier = '';
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });
    it('checkPendingAndStartGame three deposits', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = false;
      expectedGameState.gameReset = false;
      expectedGameState.timer = game.MAX_TIMER - game.TWO;
      expectedGameState.pot = game.TWO;
      expectedGameState.playersByAccount = new Map();
      const accountCoranosJson = {
        'nickname': 'BAN_1CORA...OCDXA',
        'totalBansRemainder': '0',
        'totalBansSpent': '5',
        'deposits': [
          '11C4A9F4C89C452C2B5025E07D20C0FE2E0A983B234786D36C7545E2A4379FE1',
          'A83879E4D14E5D2F2CE4B3D8AE1D01B7684E6DE4E38587B14DB665A5AF4DF95F',
          '04ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
        ],
        'bans': '3',
        'nextBans': '3',
      };
      expectedGameState.playersByAccount.set(testUtil.ACCOUNT_CORANOS, accountCoranosJson);
      expectedGameState.winners = {};
      util.init(testConfig, loggingUtilLogOff);
      const accountHistory = require('../data/account-history-000.json').history.slice(0, 3).reverse();
      const bananodeApiData = {};
      bananodeApiData.accountHistory = accountHistory;
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.balance = '0';
      bananodeApiData.accountInfo.frontier = '';
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });

    it('checkPendingAndStartGame 8 deposits', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = false;
      expectedGameState.gameReset = false;
      expectedGameState.timer = BigInt(16);
      expectedGameState.pot = BigInt(5);
      expectedGameState.playersByAccount = new Map();
      const accountCoranosJson = {
        'nickname': 'BAN_1CORA...OCDXA',
        'totalBansRemainder': '2',
        'totalBansSpent': '6',
        'deposits': [
          '11C4A9F4C89C452C2B5025E07D20C0FE2E0A983B234786D36C7545E2A4379FE1',
          'A83879E4D14E5D2F2CE4B3D8AE1D01B7684E6DE4E38587B14DB665A5AF4DF95F',
          '04ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
          'BACD363EB96EA5ACB1D13B2CD071499156CBAE7F6D22AF22122EAD371A94E863',
          '8125C05952748E51C004CE8ED1A5E0305B8FE61A835C667B3EA311D8F9857BD2',
          '67677559B96EF6379893DAE0C9E75139A29350A1C902B1CD50D481FBFF63A404',
        ],
        'bans': '3',
        'nextBans': '3',
      };
      const accountBanin11Json = {
        'nickname': 'BAN_3BANI...1OJIU',
        'totalBansRemainder': '1',
        'totalBansSpent': '5',
        'deposits': [
          'D60C4A56C6BE8F6FDBCEC61974C6CE287E17B4A1637BEFF97C4B9D88585E6826',
          '63836CBAA3AFB84F8003A277175CD2C832ED1A4A59BDCDCEB2B77CB7D6E69344',
        ],
        'bans': '3',
        'nextBans': '3',
      };
      expectedGameState.playersByAccount.set(testUtil.ACCOUNT_CORANOS, accountCoranosJson);
      expectedGameState.playersByAccount.set(testUtil.ACCOUNT_BANIN11, accountBanin11Json);
      expectedGameState.winners = {};
      util.init(testConfig, loggingUtilLogOff);
      const accountHistory = require('../data/account-history-000.json').history.slice(0, 8).reverse();
      const bananodeApiData = {};
      bananodeApiData.accountHistory = accountHistory;
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.balance = '191';
      bananodeApiData.accountInfo.frontier = '';
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });

    it('checkPendingAndStartGame all deposits', async () => {
      const expectedGameState = {
      	'gameStarted': true,
      	'gameFinished': true,
      	'gameReset': false,
      	'timer': '0',
      	'pot': '26',
      	'playersByAccount': {
      	},
      	'winners': {
        },
      };

      expectedGameState.playersByAccount = {
        'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1CORA...OCDXA',
          'totalBansRemainder': '17',
          'totalBansSpent': '176',
          'deposits': [
            '77677559B96EF6379893DAE0C9E75139A29350A1C902B1CD50D481FBFF63A404',
            '67677559B96EF6379893DAE0C9E75139A29350A1C902B1CD50D481FBFF63A404',
            '8125C05952748E51C004CE8ED1A5E0305B8FE61A835C667B3EA311D8F9857BD2',
            'BACD363EB96EA5ACB1D13B2CD071499156CBAE7F6D22AF22122EAD371A94E863',
            '04ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
            'A83879E4D14E5D2F2CE4B3D8AE1D01B7684E6DE4E38587B14DB665A5AF4DF95F',
            '11C4A9F4C89C452C2B5025E07D20C0FE2E0A983B234786D36C7545E2A4379FE1',
          ],
          'bans': '153',
          'nextBans': '18',
        },
        'ban_1doranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1DORA...OCDXA',
          'totalBansRemainder': '1',
          'totalBansSpent': '3',
          'deposits': [
            '09ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
            '08ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
          ],
          'bans': '2',
          'nextBans': '2',
        },
        'ban_1horanoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1HORA...OCDXA',
          'totalBansRemainder': '0',
          'totalBansSpent': '1',
          'deposits': [
            '07ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
          ],
          'bans': '1',
          'nextBans': '1',
        },
        'ban_1goranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1GORA...OCDXA',
          'totalBansRemainder': '0',
          'totalBansSpent': '1',
          'deposits': [
            '06ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
          ],
          'bans': '1',
          'nextBans': '1',
        },
        'ban_1foranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1FORA...OCDXA',
          'totalBansRemainder': '0',
          'totalBansSpent': '1',
          'deposits': [
            '05ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
          ],
          'bans': '1',
          'nextBans': '1',
        },
        'ban_1eoranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1EORA...OCDXA',
          'totalBansRemainder': '0',
          'totalBansSpent': '1',
          'deposits': [
            '04ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
          ],
          'bans': '1',
          'nextBans': '1',
        },
        'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu': {
          'nickname': 'BAN_3BANI...1OJIU',
          'totalBansRemainder': '1',
          'totalBansSpent': '5',
          'deposits': [
            '63836CBAA3AFB84F8003A277175CD2C832ED1A4A59BDCDCEB2B77CB7D6E69344',
            'D60C4A56C6BE8F6FDBCEC61974C6CE287E17B4A1637BEFF97C4B9D88585E6826',
          ],
          'bans': '3',
          'nextBans': '3',
        },
      };
      expectedGameState.winners = {
        'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1CORA...OCDXA',
          'bans': '153',
          'unusedBans': '12',
          'pot': '26',
          'paidBans': '0',
          'unpaidBans': '191',
        },
        'ban_1doranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1doranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1DORA...OCDXA',
          'bans': '2',
          'unusedBans': '1',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '3',
        },
        'ban_1horanoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1horanoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1HORA...OCDXA',
          'bans': '1',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '1',
        },
        'ban_1goranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1goranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1GORA...OCDXA',
          'bans': '1',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '1',
        },
        'ban_1foranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1foranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1FORA...OCDXA',
          'bans': '1',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '1',
        },
        'ban_1eoranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1eoranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1EORA...OCDXA',
          'bans': '1',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '1',
        },
        'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu': {
          'account': 'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu',
          'nickname': 'BAN_3BANI...1OJIU',
          'bans': '3',
          'unusedBans': '1',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '4',
        },
      };
      util.init(testConfig, loggingUtilLogOff);
      const accountHistory = require('../data/account-history-000.json').history.slice(0);
      const bananodeApiData = {};
      bananodeApiData.accountHistory = accountHistory;
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.frontier = '';
      bananodeApiData.accountInfo.balance = bananojs.getRawStrFromBanoshiStr('19100');
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });
    it('checkPendingAndStartGame game won', async () => {
      const expectedGameState = {};
      expectedGameState.gameStarted = true;
      expectedGameState.gameFinished = true;
      expectedGameState.gameReset = false;
      expectedGameState.timer = BigInt(0);
      expectedGameState.pot = BigInt(36);
      expectedGameState.playersByAccount = {
        'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'nickname': 'BAN_1CORA...OCDXA',
          'totalBansRemainder': '0',
          'totalBansSpent': '8',
          'deposits': [
            '67677559B96EF6379893DAE0C9E75139A29350A1C902B1CD50D481FBFF63A404',
            '8125C05952748E51C004CE8ED1A5E0305B8FE61A835C667B3EA311D8F9857BD2',
            'BACD363EB96EA5ACB1D13B2CD071499156CBAE7F6D22AF22122EAD371A94E863',
            '04ED0F9F9784F6D0DFAE1E9BD0679B2D72F4B201CB13BF2FD72D04323EF03837',
            'A83879E4D14E5D2F2CE4B3D8AE1D01B7684E6DE4E38587B14DB665A5AF4DF95F',
            '11C4A9F4C89C452C2B5025E07D20C0FE2E0A983B234786D36C7545E2A4379FE1',
          ],
          'bans': '18',
          'nextBans': '3',
        },
        'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu': {
          'nickname': 'BAN_3BANI...1OJIU',
          'totalBansRemainder': '0',
          'totalBansSpent': '6',
          'deposits': [
            '63836CBAA3AFB84F8003A277175CD2C832ED1A4A59BDCDCEB2B77CB7D6E69344',
            'D60C4A56C6BE8F6FDBCEC61974C6CE287E17B4A1637BEFF97C4B9D88585E6826',
          ],
          'bans': '17',
          'nextBans': '3',
        },
        'ban_3my6m4ci8g3b5djn694e8urgriihxazy4mirxxuhihpn64uqotcu8daqaksm': {
          'nickname': 'BAN_3MY6M...QAKSM',
          'totalBansRemainder': '0',
          'totalBansSpent': '5',
          'deposits': [
            'C1626A7F783F149FAC8EB3AA76882BDAC504588A13C20634F88E1195BCA5FED6',
          ],
          'bans': '17',
          'nextBans': '2',
        },
        'ban_1nb8j366qzkuu7ykh73t17dgomk41djatj5hxkni9zhuirg78oy8frg8um1a': {
          'nickname': 'BAN_1NB8J...8UM1A',
          'totalBansRemainder': '0',
          'totalBansSpent': '6',
          'deposits': [
            '695BC40DE06637EB3645EF30FC65C9B7A716EDC950CE38E3AD5FB322DA9070DE',
            '776880EB5BE0971F13DBA7B40E7CEC05810DA09AD4DBEED98B0954250F684B12',
          ],
          'bans': '17',
          'nextBans': '2',
        },
        'ban_3i63uiiq46p1yzcm6yg81khts4xmdz9nyzw7mdhggxdtq8mif8scg1q71gfy': {
          'nickname': 'BAN_3I63U...71GFY',
          'totalBansRemainder': '0',
          'totalBansSpent': '1',
          'deposits': [
            'A55DAA7B6D1580F5FBDA344DE740B4E0059B5093603A3A7724FE4884DA1F1380',
          ],
          'bans': '17',
          'nextBans': '1',
        },
        'ban_3wa9m3ph73jnkcuyi9embkc1xq3439qjcd8p4cjg5uyp1w611dm56n143x1x': {
          'nickname': 'BAN_3WA9M...43X1X',
          'totalBansRemainder': '0',
          'totalBansSpent': '1',
          'deposits': [
            '68F37B52CD1C952105CB60C1177C80D1D83563ED586E7D2A33DFF2D197228AA0',
          ],
          'bans': '17',
          'nextBans': '1',
        },
        'ban_3b3ihf5nriw4bsz7845mngu5u4mmb8ftqgzzzok8aeiyy3m7kx4tmxwhniyi': {
          'nickname': 'BAN_3B3IH...HNIYI',
          'totalBansRemainder': '0',
          'totalBansSpent': '22',
          'deposits': [
            'D276CFE1ABCCE25BD5AB7C0904AEA5ED100054DFC24D74DF2F0B5732310D2DA7',
            '4FECCEC20126ACCA736CB75145E58D4C25BDDFE4E5E85C950788D4FAA657E344',
            '60222311BA472012410C358C260D68A3934882258B2F51759585808B8157A98B',
          ],
          'bans': '18',
          'nextBans': '4',
        },
        'ban_1op7jfuae6zbtc8fdgn1yqkj79n1zmea5kg4fob1zt9mixpsmmqut1gq8zk4': {
          'nickname': 'BAN_1OP7J...Q8ZK4',
          'totalBansRemainder': '2',
          'totalBansSpent': '5',
          'deposits': [
            'C2A017F75BF4BA8BEB59CCCC827075F0CA2763B4908886D26EB3CA9217522E86',
          ],
          'bans': '16',
          'nextBans': '3',
        },
        'ban_3aq6qsmy4g6qms1iecja5x9qqbhcs5aia3htc8hu7serdwsp84uf9ujdzr5b': {
          'nickname': 'BAN_3AQ6Q...DZR5B',
          'totalBansRemainder': '12',
          'totalBansSpent': '255',
          'deposits': [
            '74D003A0AC6CF1C9E6CD5EE606B3C22E0F13436837C3EF2F55BAB8042A4C3B41',
          ],
          'bans': '136',
          'nextBans': '17',
        },
      },
      expectedGameState.winners= {
        'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa': {
          'account': 'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa',
          'nickname': 'BAN_1CORA...OCDXA',
          'bans': '18',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '18',
        },
        'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu': {
          'account': 'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu',
          'nickname': 'BAN_3BANI...1OJIU',
          'bans': '17',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '17',
        },
        'ban_3my6m4ci8g3b5djn694e8urgriihxazy4mirxxuhihpn64uqotcu8daqaksm': {
          'account': 'ban_3my6m4ci8g3b5djn694e8urgriihxazy4mirxxuhihpn64uqotcu8daqaksm',
          'nickname': 'BAN_3MY6M...QAKSM',
          'bans': '17',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '17',
        },
        'ban_1nb8j366qzkuu7ykh73t17dgomk41djatj5hxkni9zhuirg78oy8frg8um1a': {
          'account': 'ban_1nb8j366qzkuu7ykh73t17dgomk41djatj5hxkni9zhuirg78oy8frg8um1a',
          'nickname': 'BAN_1NB8J...8UM1A',
          'bans': '17',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '17',
        },
        'ban_3i63uiiq46p1yzcm6yg81khts4xmdz9nyzw7mdhggxdtq8mif8scg1q71gfy': {
          'account': 'ban_3i63uiiq46p1yzcm6yg81khts4xmdz9nyzw7mdhggxdtq8mif8scg1q71gfy',
          'nickname': 'BAN_3I63U...71GFY',
          'bans': '17',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '17',
        },
        'ban_3wa9m3ph73jnkcuyi9embkc1xq3439qjcd8p4cjg5uyp1w611dm56n143x1x': {
          'account': 'ban_3wa9m3ph73jnkcuyi9embkc1xq3439qjcd8p4cjg5uyp1w611dm56n143x1x',
          'nickname': 'BAN_3WA9M...43X1X',
          'bans': '17',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '17',
        },
        'ban_3b3ihf5nriw4bsz7845mngu5u4mmb8ftqgzzzok8aeiyy3m7kx4tmxwhniyi': {
          'account': 'ban_3b3ihf5nriw4bsz7845mngu5u4mmb8ftqgzzzok8aeiyy3m7kx4tmxwhniyi',
          'nickname': 'BAN_3B3IH...HNIYI',
          'bans': '18',
          'unusedBans': '0',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '18',
        },
        'ban_1op7jfuae6zbtc8fdgn1yqkj79n1zmea5kg4fob1zt9mixpsmmqut1gq8zk4': {
          'account': 'ban_1op7jfuae6zbtc8fdgn1yqkj79n1zmea5kg4fob1zt9mixpsmmqut1gq8zk4',
          'nickname': 'BAN_1OP7J...Q8ZK4',
          'bans': '16',
          'unusedBans': '2',
          'pot': '0',
          'paidBans': '0',
          'unpaidBans': '18',
        },
        'ban_3aq6qsmy4g6qms1iecja5x9qqbhcs5aia3htc8hu7serdwsp84uf9ujdzr5b': {
          'account': 'ban_3aq6qsmy4g6qms1iecja5x9qqbhcs5aia3htc8hu7serdwsp84uf9ujdzr5b',
          'nickname': 'BAN_3AQ6Q...DZR5B',
          'bans': '136',
          'unusedBans': '12',
          'pot': '36',
          'paidBans': '0',
          'unpaidBans': '184',
        },
      };

      util.init(testConfig, loggingUtilLogOff);
      const accountHistory = require('../data/account-history-001.json').history.slice(0);
      const bananodeApiData = {};
      bananodeApiData.accountHistory = accountHistory;
      bananodeApiData.accountInfo = {};
      bananodeApiData.accountInfo.balance = bananojs.getRawStrFromBanoshiStr('24000');
      bananodeApiData.accountInfo.frontier = '';
      await expectGameStateFromHistoryToMatchExpected(bananodeApiData, expectedGameState);
    });
  });


  beforeEach(async () => {
  });


  afterEach(async () => {
    bananodeApi.deactivate();
    game.deactivate();
    util.deactivate();
  });
});

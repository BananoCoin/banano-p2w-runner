'use strict';
// libraries
const chai = require('chai');
// modules
const assert = chai.assert;
const expect = chai.expect;

// constants
const ACCOUNT_CORANOS = 'ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa';
const ACCOUNT_GENESIS = 'ban_1bananobh5rat99qfgt1ptpieie5swmoth87thi74qgbfrij7dcgjiij94xr';
const ACCOUNT_BANIN11 = 'ban_3banin11445uhusn19sz6k5tgy8xwrhnbuebin1rhosq9j4bfbjt6zu1ojiu';
const ACCOUNT_DORANOS = 'ban_1doranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa';

// variables
// functions
const expectErrorMessage = async (errorMessage, fn, arg1, arg2, arg3, arg4) => {
  try {
    await fn(arg1, arg2, arg3, arg4);
  } catch (err) {
    assert.isDefined(err);
    if (err.message != errorMessage) {
      console.trace('expectErrorMessage', errorMessage, fn, err);
      expect(err.message).to.equal(errorMessage);
    }
    return;
  }
  assert.fail(`no error was thrown, expected err.message='${errorMessage}'`);
};

const expectErrorMessageRegex = async (errorMessageRegex, fn, arg1, arg2, arg3, arg4) => {
  try {
    await fn(arg1, arg2, arg3, arg4);
  } catch (err) {
    assert.isDefined(err);
    if (err.message.match(errorMessageRegex)) {
      console.trace('expectErrorMessageRegex', errorMessageRegex, fn, err);
      expect(err.message).to.match(errorMessageRegex);
    }
    return;
  }
  assert.fail(`no error was thrown, expected err.message='${errorMessageRegex}'`);
};

const stringify = (obj) => {
  const stringifyReplacer = (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    } else if (value instanceof Map) {
      const expandedMap = [...value];
      const retval = {};
      expandedMap.forEach((expandedMapElt) => {
        const retvalKey = expandedMapElt[0];
        const retvalValue = expandedMapElt[1];
        retval[retvalKey] = retvalValue;
      });
      return retval;
    } else if (value instanceof Set) {
      return [...value];
    } else {
      return value;
    }
  };
  return JSON.stringify(obj, stringifyReplacer, '\t');
};

exports.stringify = stringify;
exports.expectErrorMessage = expectErrorMessage;
exports.expectErrorMessageRegex = expectErrorMessageRegex;
exports.ACCOUNT_CORANOS = ACCOUNT_CORANOS;
exports.ACCOUNT_GENESIS = ACCOUNT_GENESIS;
exports.ACCOUNT_BANIN11 = ACCOUNT_BANIN11;
exports.ACCOUNT_DORANOS = ACCOUNT_DORANOS;

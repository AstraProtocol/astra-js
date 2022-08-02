"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genSignDoc = exports.genMessage = exports.actualAmount = void 0;

var _protoSigning = require("@cosmjs/proto-signing");

var _math = require("@cosmjs/math");

const genSignDoc = (amount, currency, recipient, memo, stdFee, signOptions) => ({
  amount,
  currency,
  recipient,
  memo,
  stdFee,
  signOptions
});

exports.genSignDoc = genSignDoc;

const actualAmount = (amount, coinDecimals) => {
  const _amount = _math.Uint64.fromNumber(Number(amount));

  const _coinDecimals = _math.Uint64.fromNumber(Number(coinDecimals));

  const tenNumber = _math.Uint64.fromNumber(10);

  return _amount.data.mul(tenNumber.data.pow(_coinDecimals.data)).toString();
};

exports.actualAmount = actualAmount;

const genMessage = type => address => __inputData => {
  const {
    recipient,
    currency: {
      coinDecimals,
      coinMinimalDenom
    },
    amount
  } = __inputData;
  return {
    type,
    value: {
      from_address: address,
      to_address: recipient,
      amount: (0, _protoSigning.coins)(actualAmount(amount, coinDecimals), coinMinimalDenom)
    }
  };
};

exports.genMessage = genMessage;
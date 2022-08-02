"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateFee = void 0;

var _stargate = require("@cosmjs/stargate");

const _calculateFee = chainInfo => {
  const {
    gasLimit,
    feeAmount,
    denom,
    gasPrice
  } = chainInfo;
  if (gasPrice) return (0, _stargate.calculateFee)(Number(gasLimit), _stargate.GasPrice.fromString(gasPrice));
  return {
    gas: gasLimit,
    amount: [{
      denom,
      amount: feeAmount
    }]
  };
};

exports.calculateFee = _calculateFee;
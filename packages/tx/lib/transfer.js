"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _signAmino = require("./signAmino");

var _txHelper = require("./tx-helper");

var _account2 = require("./account");

var _tx = require("./tx");

var _utils = require("./utils");

const signOptions = {
  preferNoSetFee: true,
  preferNoSetMemo: true
};

const transfer = async (axiosInstance, chainInfo, account, recipient, amount, _memo = '') => {
  const currency = {
    coinMinimalDenom: chainInfo.denom,
    coinDecimals: chainInfo.decimals
  };
  const fee = (0, _utils.calculateFee)(chainInfo);
  const {
    address,
    ...keys
  } = account;
  const signDoc = (0, _txHelper.genSignDoc)(amount, currency, recipient, _memo, fee, signOptions);

  const _msg = (0, _txHelper.genMessage)('cosmos-sdk/MsgSend')(address)(signDoc);

  const {
    stdFee,
    memo
  } = signDoc;

  const _account = await (0, _account2.fetchAccount)(axiosInstance, address);

  const txRawBytes = (0, _signAmino.signAmino)(keys, [_msg], stdFee, memo, {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chainInfo.chainId
  });
  return (0, _tx.sendTx)(axiosInstance, txRawBytes);
};

var _default = transfer;
exports.default = _default;
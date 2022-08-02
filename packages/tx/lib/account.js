"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchTransactions = exports.fetchAccount = void 0;

var _ramda = require("ramda");

const R = {
  pathOr: _ramda.pathOr
};

const fetchAccount = async (axiosInstance, address) => {
  const {
    data
  } = await axiosInstance.get(`auth/accounts/${address}`);
  const accountNumber = R.pathOr('0', ['result', 'base_account', 'account_number'], data);
  const sequence = R.pathOr('0', ['result', 'base_account', 'sequence'], data);
  return {
    address,
    accountNumber: `${accountNumber}`,
    sequence: `${sequence}`
  };
};

exports.fetchAccount = fetchAccount;

const fetchTransactions = async (axiosInstance, query) => {
  const {
    data
  } = await axiosInstance.get('txs', {
    params: query
  });
  return data;
};

exports.fetchTransactions = fetchTransactions;
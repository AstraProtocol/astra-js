"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendTx = exports.fetchTx = exports.fetchAllTxs = void 0;

var _ramda = require("ramda");

var _buffer = require("buffer");

const R = {
  toUpper: _ramda.toUpper,
  mergeRight: _ramda.mergeRight,
  is: _ramda.is,
  invoker: _ramda.invoker,
  prop: _ramda.prop,
  path: _ramda.path,
  flatten: _ramda.flatten,
  propOr: _ramda.propOr
};

const blackhole = () => {};

const safeExec = fn => (...args) => R.is(Function, fn) ? fn(...args) : null;

const _sendTx = async (axiosInstance, tx) => {
  const params = {
    tx_bytes: _buffer.Buffer.from(tx).toString('base64'),
    mode: 'BROADCAST_MODE_SYNC'
  };
  const result = await axiosInstance.post('/cosmos/tx/v1beta1/txs', params);
  return R.path(['data', 'tx_response'], result) || R.path(['data'], result);
};

const sendTx = async (axiosInstance, tx) => {
  const txResponse = await _sendTx(axiosInstance, tx);

  const txHash = _buffer.Buffer.from(txResponse.txhash, 'hex');

  const txHashStr = R.toUpper(_buffer.Buffer.from(txHash).toString('hex'));
  const logs = R.propOr([], 'logs', txResponse);
  return R.mergeRight({
    txHash: txHashStr,
    logs
  }, await fetchTx(axiosInstance, txHashStr, 5));
};

exports.sendTx = sendTx;

const sleep = time => new Promise(resolve => {
  setTimeout(() => resolve(), time);
});

const fetchTx = async (axiosInstance, txHash, time = 5) => {
  try {
    const result = await axiosInstance.get(`/cosmos/tx/v1beta1/txs/${txHash}`);
    if (R.path(['data', 'tx_response'], result)) return R.prop('data', result);
  } catch (e) {
    blackhole();
  }

  if (!time) {
    return {};
  }

  await sleep(safeExec(axiosInstance.getIntervalMs)() || axiosInstance.intervalMs || 500);
  return fetchTx(axiosInstance, txHash, time - 1);
};

exports.fetchTx = fetchTx;

const fetchAllTxs = async (axiosInstance, address) => {
  const fetch = async query => {
    let txs = [];
    let total = 0;
    let done = false;
    let page = 1;

    while (!done) {
      const {
        data
      } = await axiosInstance.get('/txs', {
        params: { ...query,
          page
        }
      });
      total = Number((data === null || data === void 0 ? void 0 : data.total_count) || 0);
      txs = [...txs, ...((data === null || data === void 0 ? void 0 : data.txs) || [])];
      page++;

      if (txs.length >= total) {
        done = true;
      }
    }

    return txs;
  };

  const queries = [{
    'message.sender': address
  }, {
    'transfer.recipient': address
  }];
  const txs = await Promise.all(queries.map(query => fetch(query)));
  return (0, _ramda.flatten)(txs);
};

exports.fetchAllTxs = fetchAllTxs;
import { toUpper, mergeRight, is, path, propOr, prop, flatten, invoker, always, tap } from 'ramda';
import { Buffer } from 'buffer';
import { fetchAccount } from './account';
import { signAmino, makeSimulateBody } from './signAmino';


const R = { toUpper, mergeRight, is, invoker, prop, path, flatten, propOr, always, tap };

const blackhole = () => {};
const safeExec =
  (fn) =>
  (...args) =>
    R.is(Function, fn) ? fn(...args) : null;

export const simulate = (axiosInstance, tx) => {
  const params = {
    tx_bytes: Buffer.from(tx).toString('base64'),
  };
  return axiosInstance.post('/cosmos/tx/v1beta1/simulate', params)
    .then(R.path(['data', 'gas_info', 'gas_used']))
    .catch(R.always(null));
};


const _sendTx = async (axiosInstance, tx) => {
  const params = {
    tx_bytes: Buffer.from(tx).toString('base64'),
    mode: 'BROADCAST_MODE_SYNC',
  };
  const result = await axiosInstance.post('/cosmos/tx/v1beta1/txs', params);
  return R.path(['data', 'tx_response'], result) || R.path(['data'], result);
};

export const sendTx = async (axiosInstance, tx) => {
  const txResponse = await _sendTx(axiosInstance, tx);
  const txHash = Buffer.from(txResponse.txhash, 'hex');
  const txHashStr = R.toUpper(Buffer.from(txHash).toString('hex'));
  const logs = R.propOr([], 'logs', txResponse);
  return R.mergeRight({ txHash: txHashStr, logs }, await fetchTx(axiosInstance, txHashStr, 5));
};

export const makeTx = async (axiosInstance, account, chain, tx) => {
  const { address } = account;

  const _account = await fetchAccount(axiosInstance, address);
  const _account2 =  {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chain.chainId,
  };

  const gasUsed = await simulate(axiosInstance, makeSimulateBody(tx.msgs, tx.memo, _account.sequence))
  const stdFee = {
    amount: [{
      amount: tx.fee,
      denom: chain.denom
    }],
    gas: `${Math.floor(gasUsed * ( tx.gasAdjustment || 1.3 ))}`
  }
  const txRawBytes = signAmino(
    account,
    tx.msgs,
    stdFee,
    tx.memo,
    _account2
  );
  return sendTx(axiosInstance, txRawBytes);
};

export const simulateGas = async (axiosInstance, account, tx) => {
  const { address } = account;
  const _account = await fetchAccount(axiosInstance, address);
  return simulate(axiosInstance, makeSimulateBody(tx.msgs, tx.memo, _account.sequence))
};

const sleep = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

export const fetchTx = async (axiosInstance, txHash, time = 5) => {
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

export const fetchAllTxs = async (axiosInstance, address) => {
  const fetch = async (query) => {
    let txs = [];
    let total = 0;
    let done = false;
    let page = 1;
    while (!done) {
      const { data } = await axiosInstance.get('/txs', {
        params: {
          ...query,
          page,
        },
      });
      total = Number(data?.total_count || 0);
      txs = [...txs, ...(data?.txs || [])];
      page++;
      if (txs.length >= total) {
        done = true;
      }
    }
    return txs;
  };

  const queries = [{ 'message.sender': address }, { 'transfer.recipient': address }];

  const txs = await Promise.all(queries.map((query) => fetch(query)));

  return flatten(txs);
};


export const fetchTxs = async (axiosInstance, query) => {
  const { data } = await axiosInstance.get('/cosmos/tx/v1beta1/txs', {
    params: {
      order_by: 'ORDER_BY_DESC',
      ...query,
    },
  });
  return data;
};

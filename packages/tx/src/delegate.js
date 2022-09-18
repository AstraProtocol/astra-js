import { makeSimulateBody,  signAmino } from './signAmino';
import { actualAmount } from './tx-helper';
import { fetchAccount } from './account';
import { sendTx , simulate} from './tx';
import { calculateFee } from './utils';

const delegate = async (axiosInstance, chainInfo, account, validator, amount, memo = '') => {
  const { address, ...keys } = account;

  const fee = calculateFee(chainInfo);

  const msg = {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  const _account = await fetchAccount(axiosInstance, address);

  const txRawBytes = signAmino(keys, [msg], fee, memo, {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chainInfo.chainId,
  });

  return sendTx(axiosInstance, txRawBytes);
};

const simulateGasDelegate = async (axiosInstance, chainInfo, account, validator, amount, memo = '') => {
  const { address } = account;
  const msg = {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  const _account = await fetchAccount(axiosInstance, address);
  const txRawBytes = makeSimulateBody([msg], memo, _account.sequence);
  return simulate(axiosInstance, txRawBytes);
};

delegate.simulate = simulateGasDelegate;

export default delegate;

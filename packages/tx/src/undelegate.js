import { actualAmount } from './tx-helper';
import { makeTx, simulateGas } from './tx';

const unDelegate = async (axiosInstance, chainInfo, account, validator, amount, fee) => {
  const { address } = account;
  const msg = {
    type: 'cosmos-sdk/MsgUndelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  const tx = {msgs: [msg], fee}
  return makeTx(axiosInstance, account, chainInfo, tx);
};

const simulateGasUnDelegate = async (axiosInstance, chainInfo, account, validator, amount) => {
  const { address } = account;

  const msg = {
    type: 'cosmos-sdk/MsgUndelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  return simulateGas(axiosInstance, account, { msgs: [msg] }, chainInfo)
};


unDelegate .simulate = simulateGasUnDelegate;

export default unDelegate;

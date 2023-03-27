import { actualAmount } from './tx-helper';
import { makeTx, simulateGas } from './tx';

const delegate = async (axiosInstance, chainInfo, account, validator, amount, fee) => {
  console.log(chainInfo, account, validator, amount, fee);
  const { address } = account;
  const msg = {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };

  const tx = {
    msgs: [msg],
    fee,
  }
  
  return makeTx(axiosInstance, account, chainInfo, tx);
};

const simulateGasDelegate = async (axiosInstance, chainInfo, account, validator, amount) => {
  const { address } = account;
  const msg = {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  return simulateGas(axiosInstance, account, { msgs: [msg] }, chainInfo)
};

delegate.simulate = simulateGasDelegate;

export default delegate;

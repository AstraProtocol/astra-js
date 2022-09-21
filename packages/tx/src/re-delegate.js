import { actualAmount } from './tx-helper';
import { makeTx, simulateGas } from './tx';

const reDelegate = async (
  axiosInstance,
  chainInfo,
  account,
  srcValidator,
  dstValidator,
  amount,
  fee,
) => {
  const { address } = account;

  const msg = {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      validator_src_address: srcValidator,
      validator_dst_address: dstValidator,
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

const simulateGasReDelegate = async (
  axiosInstance,
  chainInfo,
  account,
  srcValidator,
  dstValidator,
  amount,
) => {
  const { address } = account;
  const msg = {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      validator_src_address: srcValidator,
      validator_dst_address: dstValidator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  return simulateGas(axiosInstance, account, { msgs: [msg] })
};

reDelegate.simulate = simulateGasReDelegate;

export default reDelegate;

import { actualAmount } from './tx-helper';
import { makeTx, simulateGas } from './tx';


const send = async (axiosInstance, chainInfo, account, recipient, amount, _fee, _memo = '') => {
  const { address } = account;

  const _msg = { type: 'cosmos-sdk/MsgSend',
    value: {
      from_address: address,
      to_address: recipient,
      amount: [{
        amount: actualAmount(amount, chainInfo.decimals),
        denom: chainInfo.denom
      }]
    },
  }
  const tx = {
    msgs: [_msg],
    gasAdjustment: chainInfo.gasAdjustment['send'],
    fee: _fee,
    memo: _memo
  }
  return makeTx(axiosInstance, account, chainInfo, tx);
}

const simulator = async (axiosInstance, chainInfo, account, recipient, amount, _memo = '') => {
  const { address } = account;
  const _msg = { type: 'cosmos-sdk/MsgSend',
    value: {
      from_address: address,
      to_address: recipient,
      amount: [{
        amount: actualAmount(amount, chainInfo.decimals),
        denom: chainInfo.denom
      }]
    },
  }
  return simulateGas(axiosInstance, account, { msgs: [_msg]})
};

send.simulate  = simulator;
export default send;

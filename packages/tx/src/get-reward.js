import { makeTx, simulateGas } from './tx';

const withdrawDelegatorReward = async (axiosInstance, chainInfo, account, validator, fee) => {
  const { address } = account;

  const _validators = Array.isArray(validator) ? validator : [validator];
  const msgs = _validators.map((_validator) => ({
    type: 'cosmos-sdk/MsgWithdrawDelegationReward',
    value: {
      validator_address: _validator,
      delegator_address: address,
    },
  }))

  const tx = {
    msgs,
    fee,
  }
  return makeTx(axiosInstance, account, chainInfo, tx);
};

const simulateGasWithdrawDelegatorReward = async (axiosInstance, chainInfo, account, validator) => {
  const { address } = account;

  const _validators = Array.isArray(validator) ? validator : [validator];
  const msgs = _validators.map((_validator) => ({
    type: 'cosmos-sdk/MsgWithdrawDelegationReward',
    value: {
      validator_address: _validator,
      delegator_address: address,
    },
  }));
  return simulateGas(axiosInstance, account, { msgs }, chainInfo)

};


withdrawDelegatorReward.simulate = simulateGasWithdrawDelegatorReward;

export default withdrawDelegatorReward;

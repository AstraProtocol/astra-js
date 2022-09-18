import { makeSimulateBody,  signAmino } from './signAmino';
import { fetchAccount } from './account';
import { sendTx , simulate} from './tx';
import { calculateFee } from './utils';

const withdrawDelegatorReward = async (axiosInstance, chainInfo, account, validator, memo = '') => {
  const { address, ...keys } = account;

  const fee = calculateFee(chainInfo);
  const _validators = Array.isArray(validator) ? validator : [validator];
  const msgs = _validators.map((_validator) => ({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        validator_address: _validator,
        delegator_address: address,
      },
    }))

  const _account = await fetchAccount(axiosInstance, address);

  const txRawBytes = signAmino(
    keys,
    msgs,
    fee,
    memo,
    {
      accountNumber: _account.accountNumber,
      sequence: _account.sequence,
      chainId: chainInfo.chainId,
    }
  );

  return sendTx(axiosInstance, txRawBytes);
};

const simulateGasWithdrawDelegatorReward = async (axiosInstance, _, account, validator, memo = '') => {
  const { address } = account;

  const _validators = Array.isArray(validator) ? validator : [validator];
  const msgs = _validators.map((_validator) => ({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        validator_address: _validator,
        delegator_address: address,
      },
    }))
  const _account = await fetchAccount(axiosInstance, address);

  const txRawBytes = makeSimulateBody(msgs, memo, _account.sequence);
  return simulate(axiosInstance, txRawBytes);
};


withdrawDelegatorReward.simulate = simulateGasWithdrawDelegatorReward;

export default withdrawDelegatorReward;

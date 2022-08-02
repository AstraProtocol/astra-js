import { signAmino } from './signAmino';
import { actualAmount } from './tx-helper';
import { fetchAccount } from './account';
import { sendTx } from './tx';
import { calculateFee } from './utils';
import { compose, sum, flatten, prop, mergeLeft, map, find, propEq, pathOr, filter } from 'ramda';

const R = { compose, sum, flatten, prop, pathOr, map, mergeLeft, find, propEq, filter };

/**
 *
 * @param {*} getItemFromRes Function to get data from response
 * @param {*} url  service url
 */
const getAll = async (getItemFromRes, url, axiosInstance) => {
  try {
    let result = [];
    let key = null;
    const query = (key) => {
      const params = {};
      if (key) {
        params['pagination.key'] = key;
      }
      return axiosInstance.get(url, { params });
    };
    do {
      const res = await query(key);
      result = [...result, ...getItemFromRes(res)];
      key = R.pathOr(null, ['data', 'pagination', 'next_key'], res);
    } while (key !== null);
    return result;
  } catch (e) {
    console.log(e, url);
  }
};

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

const reDelegate = async (
  axiosInstance,
  chainInfo,
  account,
  srcValidator,
  dstValidator,
  amount,
  memo = ''
) => {
  const { address, ...keys } = account;

  const fee = calculateFee(chainInfo);

  const msg = {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      validator_src_address: srcValidator,
      validator_dst_address: dstValidator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  const _account = await fetchAccount(axiosInstance, address);

  const txRawBytes = signAmino(
    keys,
    [msg],
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

const unDelegate = async (axiosInstance, chainInfo, account, validator, amount, memo = '') => {
  const { address, ...keys } = account;

  const fee = calculateFee(chainInfo);

  const msg = {
    type: 'cosmos-sdk/MsgUndelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: { denom: chainInfo.denom, amount: actualAmount(amount, chainInfo.decimals) },
    },
  };
  const _account = await fetchAccount(axiosInstance, address);

  const txRawBytes = signAmino(
    keys,
    [msg],
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

const withdrawDelegatorReward = async (axiosInstance, chainInfo, account, validator, memo = '') => {
  const { address, ...keys } = account;

  const fee = calculateFee(chainInfo);

  let msgs = [];
  if (Array.isArray(validator)) {
    msgs = validator.map((v) => ({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        validator_address: v,
        delegator_address: address,
      },
    }));
  } else {
    msgs.push({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        validator_address: validator,
        delegator_address: address,
      },
    });
  }
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

const getValidators = async (axiosInstance, { address }) => {
  try {
    const [rewards, delegations, validators, unbondingDelegations] = await Promise.all([
      getAll(
        R.pathOr([], ['data', 'rewards']),
        `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
        axiosInstance
      ),
      getAll(
        R.pathOr([], ['data', 'delegation_responses']),
        `/cosmos/staking/v1beta1/delegations/${address}`,
        axiosInstance
      ),
      getAll(
        R.pathOr([], ['data', 'validators']),
        'cosmos/staking/v1beta1/validators',
        axiosInstance
      ),
      getAll(
        R.pathOr([], ['data', 'unbonding_responses']),
        `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
        axiosInstance
      ),
    ]);

    const result = R.map(
      (val) => {
        const delegation = delegations.find(
          (d) => d?.delegation?.validator_address === val?.operator_address
        );
        const reward = rewards.find((d) => d?.validator_address === val?.operator_address);

        return {
          name: val?.description?.moniker,
          address: val?.operator_address,
          shares: delegation?.delegation?.shares || 0,
          reward: reward?.reward?.[0]?.amount || 0,
          token: val.tokens,
          commission_rate: val.commission.commission_rates.rate,
          max_change_rate: val.commission.commission_rates.max_change_rate,
        };
      },
      R.filter((v) => !v.jailed, validators)
    );

    const unbondingDelegationBalances = R.map(
      (d) => R.map((e) => Number(R.prop('balance', e)), R.prop('entries', d)),
      unbondingDelegations
    );

    return {
      result,
      delegations,
      rewards,
      totalUnbondingDelegation: R.compose(R.sum, R.flatten)(unbondingDelegationBalances),
    };
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getUnbondingDelegations = async (axiosInstance, { address }) => {
  try {
    const [validators, unbondingDelegations] = await Promise.all([
      getAll(
        R.pathOr([], ['data', 'validators']),
        'cosmos/staking/v1beta1/validators',
        axiosInstance
      ),
      getAll(
        R.pathOr([], ['data', 'unbonding_responses']),
        `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
        axiosInstance
      ),
    ]);
    return R.map((record) => {
      return R.mergeLeft(
        record,
        R.find(R.propEq('operator_address', record.validator_address), validators)
      );
    }, unbondingDelegations);
  } catch (e) {
    return [];
  }
};

const getUnbondingDelegation = async (axiosInstance, { address }, validatorAddress) => {
  try {
    return await getAll(
      R.pathOr([], ['data', 'unbond', 'entries']),
      `cosmos/staking/v1beta1/validators/${validatorAddress}/delegations/${address}/unbonding_delegation`,
      axiosInstance
    );
  } catch (e) {
    return [];
  }
};

const getValidator = async (axiosInstance, account, validatorAddress) => {
  const prs = [
    axiosInstance.get('/staking/validators/' + validatorAddress),
    axiosInstance.get('/distribution/validators/' + validatorAddress),
    axiosInstance.get(
      `/cosmos/distribution/v1beta1/delegators/${account.address}/rewards/${validatorAddress}`
    ),
    axiosInstance.get(`/staking/delegators/${account.address}/delegations/${validatorAddress}`),
  ];
  const datas = await Promise.all(prs);
  return {
    data: datas[0].data,
    distribution: datas[1].data,
    reward: datas[2].data,
    delegation: datas[3].data,
  };
};
export default {
  getValidators,
  delegate,
  reDelegate,
  unDelegate,
  withdrawDelegatorReward,
  getValidator,
  getUnbondingDelegations,
  getUnbondingDelegation,
};

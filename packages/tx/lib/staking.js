"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _signAmino = require("./signAmino");

var _txHelper = require("./tx-helper");

var _account2 = require("./account");

var _tx = require("./tx");

var _utils = require("./utils");

var _ramda = require("ramda");

const R = {
  compose: _ramda.compose,
  sum: _ramda.sum,
  flatten: _ramda.flatten,
  prop: _ramda.prop,
  pathOr: _ramda.pathOr,
  map: _ramda.map,
  mergeLeft: _ramda.mergeLeft,
  find: _ramda.find,
  propEq: _ramda.propEq,
  filter: _ramda.filter
};
/**
 *
 * @param {*} getItemFromRes Function to get data from response
 * @param {*} url  service url
 */

const getAll = async (getItemFromRes, url, axiosInstance) => {
  try {
    let result = [];
    let key = null;

    const query = key => {
      const params = {};

      if (key) {
        params['pagination.key'] = key;
      }

      return axiosInstance.get(url, {
        params
      });
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
  const {
    address,
    ...keys
  } = account;
  const fee = (0, _utils.calculateFee)(chainInfo);
  const msg = {
    type: 'cosmos-sdk/MsgDelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: {
        denom: chainInfo.denom,
        amount: (0, _txHelper.actualAmount)(amount, chainInfo.decimals)
      }
    }
  };

  const _account = await (0, _account2.fetchAccount)(axiosInstance, address);

  const txRawBytes = (0, _signAmino.signAmino)(keys, [msg], fee, memo, {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chainInfo.chainId
  });
  return (0, _tx.sendTx)(axiosInstance, txRawBytes);
};

const reDelegate = async (axiosInstance, chainInfo, account, srcValidator, dstValidator, amount, memo = '') => {
  const {
    address,
    ...keys
  } = account;
  const fee = (0, _utils.calculateFee)(chainInfo);
  const msg = {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    value: {
      validator_src_address: srcValidator,
      validator_dst_address: dstValidator,
      delegator_address: address,
      amount: {
        denom: chainInfo.denom,
        amount: (0, _txHelper.actualAmount)(amount, chainInfo.decimals)
      }
    }
  };

  const _account = await (0, _account2.fetchAccount)(axiosInstance, address);

  const txRawBytes = (0, _signAmino.signAmino)(keys, [msg], fee, memo, {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chainInfo.chainId
  });
  return (0, _tx.sendTx)(axiosInstance, txRawBytes);
};

const unDelegate = async (axiosInstance, chainInfo, account, validator, amount, memo = '') => {
  const {
    address,
    ...keys
  } = account;
  const fee = (0, _utils.calculateFee)(chainInfo);
  const msg = {
    type: 'cosmos-sdk/MsgUndelegate',
    value: {
      validator_address: validator,
      delegator_address: address,
      amount: {
        denom: chainInfo.denom,
        amount: (0, _txHelper.actualAmount)(amount, chainInfo.decimals)
      }
    }
  };

  const _account = await (0, _account2.fetchAccount)(axiosInstance, address);

  const txRawBytes = (0, _signAmino.signAmino)(keys, [msg], fee, memo, {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chainInfo.chainId
  });
  return (0, _tx.sendTx)(axiosInstance, txRawBytes);
};

const withdrawDelegatorReward = async (axiosInstance, chainInfo, account, validator, memo = '') => {
  const {
    address,
    ...keys
  } = account;
  const fee = (0, _utils.calculateFee)(chainInfo);
  let msgs = [];

  if (Array.isArray(validator)) {
    msgs = validator.map(v => ({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        validator_address: v,
        delegator_address: address
      }
    }));
  } else {
    msgs.push({
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        validator_address: validator,
        delegator_address: address
      }
    });
  }

  const _account = await (0, _account2.fetchAccount)(axiosInstance, address);

  const txRawBytes = (0, _signAmino.signAmino)(keys, msgs, fee, memo, {
    accountNumber: _account.accountNumber,
    sequence: _account.sequence,
    chainId: chainInfo.chainId
  });
  return (0, _tx.sendTx)(axiosInstance, txRawBytes);
};

const getValidators = async (axiosInstance, {
  address
}) => {
  try {
    const [rewards, delegations, validators, unbondingDelegations] = await Promise.all([getAll(R.pathOr([], ['data', 'rewards']), `/cosmos/distribution/v1beta1/delegators/${address}/rewards`, axiosInstance), getAll(R.pathOr([], ['data', 'delegation_responses']), `/cosmos/staking/v1beta1/delegations/${address}`, axiosInstance), getAll(R.pathOr([], ['data', 'validators']), 'cosmos/staking/v1beta1/validators', axiosInstance), getAll(R.pathOr([], ['data', 'unbonding_responses']), `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`, axiosInstance)]);
    const result = R.map(val => {
      var _val$description, _delegation$delegatio, _reward$reward, _reward$reward$;

      const delegation = delegations.find(d => {
        var _d$delegation;

        return (d === null || d === void 0 ? void 0 : (_d$delegation = d.delegation) === null || _d$delegation === void 0 ? void 0 : _d$delegation.validator_address) === (val === null || val === void 0 ? void 0 : val.operator_address);
      });
      const reward = rewards.find(d => (d === null || d === void 0 ? void 0 : d.validator_address) === (val === null || val === void 0 ? void 0 : val.operator_address));
      return {
        name: val === null || val === void 0 ? void 0 : (_val$description = val.description) === null || _val$description === void 0 ? void 0 : _val$description.moniker,
        address: val === null || val === void 0 ? void 0 : val.operator_address,
        shares: (delegation === null || delegation === void 0 ? void 0 : (_delegation$delegatio = delegation.delegation) === null || _delegation$delegatio === void 0 ? void 0 : _delegation$delegatio.shares) || 0,
        reward: (reward === null || reward === void 0 ? void 0 : (_reward$reward = reward.reward) === null || _reward$reward === void 0 ? void 0 : (_reward$reward$ = _reward$reward[0]) === null || _reward$reward$ === void 0 ? void 0 : _reward$reward$.amount) || 0,
        token: val.tokens,
        commission_rate: val.commission.commission_rates.rate,
        max_change_rate: val.commission.commission_rates.max_change_rate
      };
    }, R.filter(v => !v.jailed, validators));
    const unbondingDelegationBalances = R.map(d => R.map(e => Number(R.prop('balance', e)), R.prop('entries', d)), unbondingDelegations);
    return {
      result,
      delegations,
      rewards,
      totalUnbondingDelegation: R.compose(R.sum, R.flatten)(unbondingDelegationBalances)
    };
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getUnbondingDelegations = async (axiosInstance, {
  address
}) => {
  try {
    const [validators, unbondingDelegations] = await Promise.all([getAll(R.pathOr([], ['data', 'validators']), 'cosmos/staking/v1beta1/validators', axiosInstance), getAll(R.pathOr([], ['data', 'unbonding_responses']), `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`, axiosInstance)]);
    return R.map(record => {
      return R.mergeLeft(record, R.find(R.propEq('operator_address', record.validator_address), validators));
    }, unbondingDelegations);
  } catch (e) {
    return [];
  }
};

const getUnbondingDelegation = async (axiosInstance, {
  address
}, validatorAddress) => {
  try {
    return await getAll(R.pathOr([], ['data', 'unbond', 'entries']), `cosmos/staking/v1beta1/validators/${validatorAddress}/delegations/${address}/unbonding_delegation`, axiosInstance);
  } catch (e) {
    return [];
  }
};

const getValidator = async (axiosInstance, account, validatorAddress) => {
  const prs = [axiosInstance.get('/staking/validators/' + validatorAddress), axiosInstance.get('/distribution/validators/' + validatorAddress), axiosInstance.get(`/cosmos/distribution/v1beta1/delegators/${account.address}/rewards/${validatorAddress}`), axiosInstance.get(`/staking/delegators/${account.address}/delegations/${validatorAddress}`)];
  const datas = await Promise.all(prs);
  return {
    data: datas[0].data,
    distribution: datas[1].data,
    reward: datas[2].data,
    delegation: datas[3].data
  };
};

var _default = {
  getValidators,
  delegate,
  reDelegate,
  unDelegate,
  withdrawDelegatorReward,
  getValidator,
  getUnbondingDelegations,
  getUnbondingDelegation
};
exports.default = _default;
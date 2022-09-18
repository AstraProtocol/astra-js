import { miniStream } from '../utils';
import {
  propOr,
  always,
  isEmpty,
  head,
  path,
  pathOr,
  defaultTo,
  objOf,
  mapObjIndexed,
  mergeLeft,
} from 'ramda';
import { EthSecp256k1HdWallet } from '@astra/wallet';
import { Bip39, Random, Slip10RawIndex, EnglishMnemonic } from '@cosmjs/crypto';
import { bip44HDPathToPath, bip44HDPath as _bip44HDPath } from '../config';
import {
  addressConverter,
  fetchAllTxs,
  fetchTx,
  fetchTxs,
  send,
  staking,
  signEthTransaction,
  detectAddressType,
  calculateFee,
} from '@astra/tx';
import * as SignClient from '../SignClient';

const R = {
  propOr,
  always,
  isEmpty,
  head,
  path,
  pathOr,
  defaultTo,
  objOf,
  mapObjIndexed,
  mergeLeft,
};

const hdPath = [
  Slip10RawIndex.hardened(44),
  Slip10RawIndex.hardened(60),
  Slip10RawIndex.hardened(0),
  Slip10RawIndex.normal(0),
  Slip10RawIndex.normal(0),
];

export const KEYRING_STATUSES = {
  NOTLOADED: 0,
  EMPTY: 1,
  LOCKED: 2,
  UNLOCKED: 3,
};

export const generateSeed = (length = 12) => {
  const entropyLength = 4 * Math.floor((11 * length) / 33);
  const entropy = Random.getBytes(entropyLength);
  return Bip39.encode(entropy).data;
};

const createProvider = (configs) => {
  const { chainInfo, RNG, bip44HDPath, kdf, storage, axios, storageGenerator } = configs;

  const self = {
    stream: miniStream(),
    RNG,
    bip44HDPath: bip44HDPathToPath(_bip44HDPath(bip44HDPath)),
    kdf: kdf || 'scrypt',
    keyStore: {},
    address: null,
    mnemonic: null,
    account: {},
    password: null,
    status: KEYRING_STATUSES.NOTLOADED,
    chainInfo,
    axiosInstance: axios.create({ baseURL: chainInfo.lcdUrl }),
    balances: {},
    signClient: null,
    gasConfig: {},
    cacheStore: storageGenerator('cache'),
  };

  const initSignClient = async (options) => {
    self.signClient = await SignClient.init(options, self.stream);
  };

  const _createMnemonicKeyStore = async (mnemonic, password) => {
    const prefix = self.chainInfo.bech32Prefix;
    const original = await EthSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [hdPath],
      prefix: prefix,
    });
    const keyStore = await original.serialize(password);
    await storage.setItem(keyStore);
    self.password = password;
    self.mnemonic = mnemonic;
    self.keyStore = keyStore;
    self.deserialized = original;
    return keyStore;
  };

  const lock = () => {
    self.password = null;
    self.account = {};
    self.address = null;
    self.deserialized = null;
    self.status = KEYRING_STATUSES.LOCKED;
    self.stream.invoke('status', self.status);
  };

  const clear = async () => {
    await storage.removeItem();
    self.account = {};
    self.address = null;
    self.password = null;
    self.keyStore = {};
    self.deserialized = null;
    self.mnemonic = {};
    self.status = KEYRING_STATUSES.EMPTY;
    self.stream.invoke('status', self.status);
  };

  const unlockNewKeystore = async () => {
    const { deserialized } = self;
    const account = R.head(await deserialized.getAccountsWithPrivkeys());
    self.account = account;
    self.address = account.address;
    self.status = KEYRING_STATUSES.UNLOCKED;
    self.stream.invoke('status', self.status);
  };

  const unlock = async (password) => {
    self.password = password;
    const deserialized = await EthSecp256k1HdWallet.deserialize(self.keyStore, password);
    self.mnemonic = deserialized.mnemonic;
    const account = R.head(await deserialized.getAccountsWithPrivkeys());
    self.account = account;
    self.address = account.address;
    self.deserialized = deserialized;
    self.status = KEYRING_STATUSES.UNLOCKED;
    self.stream.invoke('status', self.status);
  };

  const updateChainInfo = async (chainInfo) => {
    self.chainInfo = chainInfo;
    self.axiosInstance = axios.create({ baseURL: chainInfo.lcdUrl });
  };

  const updatePassword = async (newPassword) => {
    self.password = newPassword;
    await _createMnemonicKeyStore(self.mnemonic, newPassword);
  };

  const validatePassword = (password) => {
    return self.password === password;
  };

  const getMnemonic = (password) => {
    if (self.password === password) {
      return self.mnemonic;
    }
    throw new Error('Mật khẩu không đúng');
  };

  const onStatus = (callback) => {
    return self.stream.register('status', callback);
  };
  const onBalances = (callback) => {
    return self.stream.register('balances', callback);
  };
  const onGasSimulate = (callback) => {
    return self.stream.register('gas', callback);
  };
  const onFeeSimulate = (callback) => {
    return self.stream.register('fee', callback);
  };
  const _send = async (recipient, amount, fee) => {
    return send(self.axiosInstance, self.chainInfo, self.account, recipient, amount, fee);
  };

  const _simulateSend = async (recipient, amount, memo) => {
    const gasUsed = await send.simulate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      recipient,
      amount,
      memo
    );
    storeSimulation('send', gasUsed);
  };

  const storeSimulation = async (type, value) => {
    if (value) {
      const storedGasUsed = await self.cacheStore.getItem();
      const newGasConfig = R.mergeLeft(R.defaultTo({}, storedGasUsed), R.objOf(type, value));
      await self.cacheStore.setItem(newGasConfig);
      self.gasConfig = newGasConfig;
      self.stream.invoke('gas', self.gasConfig);
      self.stream.invoke('fee', feeSimulatorFromGasConfig(self.gasConfig));
    }
  };

  const feeSimulator = (type) => {
    const gasUsed = self.gasConfig && self.gasConfig[type];
    const { gasPrice, gasAdjustment } = chainInfo;
    const _gasAdjustment = R.propOr(1, type, gasAdjustment);
    if (gasUsed) {
      const gasLimit = Math.floor(gasUsed * _gasAdjustment);
      const feeAmount = R.pathOr(0, ['amount', 0, 'amount'], calculateFee({ gasPrice, gasLimit }));
      return feeAmount / 10 ** chainInfo.decimals;
    }
  };

  const feeSimulatorFromGasConfig = (gasConfig) => {
    const getFee = (_gasConfig, type, gasUsed) => {
      const { gasPrice, gasAdjustment } = chainInfo;
      const _gasAdjustment = R.propOr(1, type, gasAdjustment);
      if (gasUsed) {
        const gasLimit = Math.floor(gasUsed * _gasAdjustment);
        const feeAmount = R.pathOr(
          0,
          ['amount', 0, 'amount'],
          calculateFee({ gasPrice, gasLimit })
        );
        return feeAmount / 10 ** chainInfo.decimals;
      }
    };
    return R.mapObjIndexed((value, key) => getFee(gasConfig, key, value), gasConfig);
  };

  const _delegate = (validator, amount, memo) => {
    return staking.delegate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      amount,
      memo
    );
  };
  const _reDelegate = (srcValidator, dstValidator, amount, memo) => {
    return staking.reDelegate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      srcValidator,
      dstValidator,
      amount,
      memo
    );
  };
  const _unDelegate = (validator, amount, memo) => {
    return staking.unDelegate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      amount,
      memo
    );
  };
  const _withdrawDelegatorReward = (validator, memo) => {
    return staking.withdrawDelegatorReward(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      memo
    );
  };

  const fetchBalances = async () => {
    if (!self.address) {
      self.balances = [];
      self.stream.invoke('balances', self.balances);
      return [];
    }
    const balances = self
      .axiosInstance(`cosmos/bank/v1beta1/balances/${self.address}`)
      .then(R.propOr([], 'data'))
      .catch(R.always([]));
    self.balances = balances;
    self.stream.invoke('balances', self.balances);
    return balances;
  };
  const load = async () => {
    const _keyStore = await storage.getItem(keyStore);
    self.gasConfig = await self.cacheStore.getItem();
    self.stream.invoke('gas', self.gasConfig);
    self.stream.invoke('fee', feeSimulatorFromGasConfig(self.gasConfig));
    const keyStore = _keyStore || {};
    self.status = R.isEmpty(keyStore) ? KEYRING_STATUSES.EMPTY : KEYRING_STATUSES.LOCKED;
    self.keyStore = keyStore;
    self.stream.invoke('status', self.status);
    return R.isEmpty(_keyStore);
  };
  const getValidators = (params = {}) => {
    return staking.getValidators(self.axiosInstance, { address: self.address }, params);
  };
  const getValidator = (validatorAddress) => {
    return staking.getValidator(self.axiosInstance, { address: self.address }, validatorAddress);
  };
  const getUnbondingDelegations = () => {
    return staking.getUnbondingDelegations(self.axiosInstance, { address: self.address });
  };
  const getUnbondingDelegation = (validatorAddress) => {
    return staking.getUnbondingDelegation(
      self.axiosInstance,
      { address: self.address },
      validatorAddress
    );
  };

  const formatToken = (amount, fraction = 2) => {
    const exp = Number(self?.chainInfo?.decimals || 18);
    const _amount = Number(Number(amount)) / 10 ** exp;
    return parseFloat(_amount.toFixed(fraction));
  };

  const _signEthTransaction = (txData) => {
    return signEthTransaction(self.account, txData);
  };

  const _fetchAllTxs = async () => {
    return fetchAllTxs(self.axiosInstance, self.address);
  };

  const _fetchTx = (txHash, time = 10) => {
    return fetchTx(self.axiosInstance, txHash, time);
  };

  const _fetchTxs = async (query) => {
    return fetchTxs(self.axiosInstance, query);
  };

  const _getEthAddress = () => {
    return self.account.ethAddress;
  };

  const getGasConfigs = () => {
    return self.gasConfig;
  };
  const getFeeConfig = () => {
    return feeSimulatorFromGasConfig(self.gasConfig);
  };

  const _addressConverter = (address) => {
    const prefix = self.chainInfo.bech32Prefix;
    const { isHex, isBech32 } = detectAddressType(prefix, address);
    if (isHex) return addressConverter(prefix).toBech32(address);
    if (isBech32) return address;
    return null;
  };

  return {
    load,
    generateSeed,
    send: _send,
    simulateSend: _simulateSend,
    feeSimulator,
    createMnemonicKeyStore: _createMnemonicKeyStore,
    getAddress: () => self.address,
    getAccount: () => self.account,
    getStatus: () => self.status,
    getBalances: fetchBalances,
    onBalances,
    onStatus,
    lock,
    unlock,
    unlockNewKeystore,
    clear,
    validateMnemonic,
    getValidators,
    getValidator,
    getUnbondingDelegations,
    getUnbondingDelegation,
    delegate: _delegate,
    reDelegate: _reDelegate,
    unDelegate: _unDelegate,
    withdrawDelegatorReward: _withdrawDelegatorReward,
    formatToken,
    updateChainInfo,
    updatePassword,
    getMnemonic,
    validatePassword,
    fetchAllTxs: _fetchAllTxs,
    fetchTx: _fetchTx,
    fetchTxs: _fetchTxs,
    initSignClient,
    getSignClient: () => self.signClient,
    signEthTransaction: _signEthTransaction,
    getEthAddress: _getEthAddress,
    addressConverter: _addressConverter,
    getGasConfigs,
    onGasSimulate,
    onFeeSimulate,
    getFeeConfig,
  };
};
export const validateMnemonic = (mnemonic) => {
  try {
    return Boolean(new EnglishMnemonic(mnemonic).data);
  } catch {
    return false;
  }
};
export { createProvider };

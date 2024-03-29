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
  mergeRight,
  flatten
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
  sendEvm,
  staking,
  signEthTransaction,
  detectAddressType,
  calculateFee,
} from '@astra/tx';
import * as SignClient from '../SignClient';
import { Dec } from '@keplr-wallet/unit';
import {abis, createContract} from '../contracts';
import createHttpProvider from '../contracts/http-provider';
import { Web3Provider } from "@ethersproject/providers"
import { transfer as transferNft } from '../nft';
import { Interface } from '@ethersproject/abi';
import abiDecoder from 'abi-decoder';

export const TxTypes = {
  SEND: 'send',
  DELEGATE: 'delegate',
  RE_DELEGATE: 're-delegate',
  UNBOND: 'unbond',
  GET_REWARD: 'get-reward',
};

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
  mergeRight,
  flatten,
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
  const axiosInstance = axios.create({ baseURL: chainInfo.lcdUrl });
  const httpProvider = createHttpProvider(chainInfo.rpcUrl, axiosInstance);
  const self = {
    erc20Tokens: chainInfo.erc20Tokens.map(config => {
      const _interface = new Interface(config.abi);
      return {
        ...config,
        contract: createContract(config.contractAddress, _interface, httpProvider)
      }
    }),
    web3Provider: new Web3Provider(httpProvider),
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
    axiosInstance,
    balances: {},
    signClient: null,
    gasConfig: {},
    cacheStore: storageGenerator('GAS_CACHE'),
  };

  const initSignClient = async (options) => {
    self.signClient = await SignClient.init(options, self.stream);
  };

  const updateGasPrice = async () => {
    try {
      const { data } = await self.axiosInstance.get('/ethermint/feemarket/v1/params');
      let gasPrice = R.pathOr(self.chainInfo.gasPrice, ['params', 'min_gas_price'], data);
      if(new Dec(gasPrice).gt(new Dec(0))) {
        self.chainInfo.gasPrice = `${new Dec(gasPrice).toString(0)}aastra`;
      }
    } catch(e) {
      console.log('UPDATE GAS PRICE ERROR', e);
    }
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

  const _send = async (recipient, amount) => {
    const fee = astra2aastra(feeSimulator(TxTypes.SEND));
    return send(self.axiosInstance, self.chainInfo, self.account, recipient, amount, fee);
  };

  const _simulateSend = async (recipient, amount) => {
    const gasUsed = await send.simulate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      recipient,
      amount
    );
    storeSimulation(TxTypes.SEND, gasUsed);
  };

  const storeSimulation = async (type, value) => {
    if (value) {
      const storedGasUsed = await self.cacheStore.getItem();
      const newGasConfig = R.mergeRight(R.defaultTo({}, storedGasUsed), R.objOf(type, value));
      await self.cacheStore.setItem(newGasConfig);
      self.gasConfig = newGasConfig;
      self.stream.invoke('gas', self.gasConfig);
      self.stream.invoke('fee', feeSimulatorFromGasConfig(self.gasConfig));
    }
  };

  const feeSimulator = (type) => {
    const gasUsed = R.propOr(chainInfo.gasLimit, type, self.gasConfig);
    const { gasPrice, gasAdjustment } = chainInfo;
    const _gasAdjustment = R.propOr(1.3, type, gasAdjustment);
    const gasLimit = Math.floor(gasUsed * _gasAdjustment);
    const feeAmount = R.pathOr(0, ['amount', 0, 'amount'], calculateFee({ gasPrice, gasLimit }));
    return feeAmount / 10 ** chainInfo.decimals;
  };

  const astra2aastra = (amount) => {
    return new Dec(amount).mul(new Dec(10 ** chainInfo.decimals)).toString(0);
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

  const _delegate = (validator, amount) => {
    const fee = astra2aastra(feeSimulator(TxTypes.DELEGATE));
    return staking.delegate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      amount,
      fee
    );
  };
  const simulateDelegate = async (validator, amount) => {
    await updateGasPrice();
    const gasUsed = await staking.delegate.simulate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      amount
    );
    await storeSimulation(TxTypes.DELEGATE, gasUsed);
  };
  const _reDelegate = (srcValidator, dstValidator, amount) => {
    const fee = astra2aastra(feeSimulator(TxTypes.RE_DELEGATE));
    return staking.reDelegate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      srcValidator,
      dstValidator,
      amount,
      fee
    );
  };
  const simulateReDelegate = async (srcValidator, dstValidator, amount) => {
    await updateGasPrice();
    const gasUsed = await staking.reDelegate.simulate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      srcValidator,
      dstValidator,
      amount
    );
    await storeSimulation(TxTypes.RE_DELEGATE, gasUsed);
  };
  const _unDelegate = (validator, amount) => {
    const fee = astra2aastra(feeSimulator(TxTypes.UNBOND));
    return staking.unDelegate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      amount,
      fee
    );
  };
  const simulateUnDelegate = async (validator, amount) => {
    await updateGasPrice();
    const gasUsed = await staking.unDelegate.simulate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      amount
    );
    await storeSimulation(TxTypes.UNBOND, gasUsed);
  };
  const _withdrawDelegatorReward = (validator) => {
    const fee = astra2aastra(feeSimulator(TxTypes.GET_REWARD));
    return staking.withdrawDelegatorReward(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator,
      fee
    );
  };

  const simulateWithdrawDelegatorReward = async (validator) => {
    await updateGasPrice();
    const gasUsed = await staking.withdrawDelegatorReward.simulate(
      self.axiosInstance,
      self.chainInfo,
      self.account,
      validator
    );
    await storeSimulation(TxTypes.GET_REWARD, gasUsed);
  };

  const fetchBalances = async () => {
    const balances = await Promise.all([
      fetchAsaBalances(),
      fetchErc20TokenBalances(),
    ])
    self.balances = R.flatten(balances);
    self.stream.invoke('balances', self.balances);
    return self.balances;
  };

  const fetchErc20TokenBalances = async () => {
    return Promise.all(self.erc20Tokens.map(async ({coinDecimals, coinMinimalDenom, contract}) => {
      const amount = await contract.balanceOf(self.account.ethAddress);
      return {
        decimal: coinDecimals,
        denom: coinMinimalDenom,
        amount: amount.toString()
      }
    }))
  };

  const fetchAsaBalances = async () => {
    if (!self.address) {
      self.balances = [];
      self.stream.invoke('balances', self.balances);
      return [];
    }
    const balances = self
      .axiosInstance(`cosmos/bank/v1beta1/balances/${self.address}`)
      .then(R.pathOr([], ['data', 'balances']))
      .catch(R.always([]));
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

  const _sendEvm = async (recipient, amount) => {
    return sendEvm(recipient, amount, self.account, self.web3Provider, self.chainInfo);
  }

  const _simulateSendEvm = async (recipient, amount) => {
    return sendEvm.simulate(recipient, amount, self.account, self.web3Provider, self.chainInfo);
  }

  const decodeEvmTxData = async txHash => { 
    const tx = await self.web3Provider.getTransaction(txHash);
    if(!tx || !tx.data) return null;

    Object.values(abis).forEach(abi => abiDecoder.addABI(abi));
    return abiDecoder.decodeMethod(tx.data);
  }

  const ticketList = (ticketAddress) => {
    // const { ethAddress } = self.account;
    // const ticketNft = TicketBox__factory.connect(ticketAddress, self.web3Provider);
    // return ticketNft.getTokenIdsOfOwner(ethAddress);
  }

  const transferTicket = (ticketAddress, ticketId, toAddress) => {
    return transferNft(ticketAddress, ticketId, toAddress, self.web3Provider, self.account, self.chainInfo)
  }

  const estimateTransferTicket = (ticketAddress, ticketId, toAddress) => {
    return transferNft.estimate(ticketAddress, ticketId, toAddress, self.web3Provider, self.account, self.chainInfo)
  }

  

  return {
    load,
    generateSeed,
    sendEvm: _sendEvm,
    simulateSendEvm: _simulateSendEvm,
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
    simulateDelegate,
    simulateReDelegate,
    simulateWithdrawDelegatorReward,
    simulateUnDelegate,
    decodeEvmTxData,
    ticketList,
    transferTicket,
    estimateTransferTicket
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

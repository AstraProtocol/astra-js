"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EthSecp256k1HdWallet = void 0;

var _ramda = require("ramda");

var _encoding = require("@cosmjs/encoding");

var _amino = require("@cosmjs/amino");

var _crypto = require("@cosmjs/crypto");

var _tx = require("@astra/tx");

const R = {
  slice: _ramda.slice,
  mergeLeft: _ramda.mergeLeft,
  map: _ramda.map,
  equals: _ramda.equals,
  compose: _ramda.compose,
  prop: _ramda.prop,
  zip: _ramda.zip,
  head: _ramda.head,
  pluck: _ramda.pluck
};

const isType60 = hdPath => {
  return R.equals(R.slice(0, 2, hdPath), (0, _crypto.stringToPath)("m/44'/60'"));
};

const getEthAddressFromPubkey = (pubkey, prefix) => {
  const uncompressPubkey = _crypto.Secp256k1.uncompressPubkey(pubkey);

  const hash = new _crypto.Keccak256(uncompressPubkey.slice(1)).digest();
  const lastTwentyBytes = hash.slice(-20);
  const getAddress = R.compose(_address => (0, _encoding.toBech32)(prefix, _address), Buffer.from);
  return getAddress(lastTwentyBytes);
};

class EthSecp256k1HdWallet extends _amino.Secp256k1HdWallet {
  static async fromMnemonic(mnemonic, options = {}) {
    const mnemonicChecked = new _crypto.EnglishMnemonic(mnemonic);
    const seed = await _crypto.Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
    return new EthSecp256k1HdWallet(mnemonicChecked, { ...options,
      seed: seed
    });
  }

  static async deserialize(keyStore, password) {
    const wallet = await _amino.Secp256k1HdWallet.deserialize(keyStore, password);
    const {
      accounts,
      mnemonic
    } = wallet;
    const {
      prefix
    } = R.head(accounts);
    const hdPaths = R.pluck('hdPath', accounts);
    return EthSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths,
      prefix
    });
  }

  async getAccountsWithPrivkeys() {
    const curAccounts = await super.getAccountsWithPrivkeys();
    const hdPathStrings = R.map(R.prop('hdPath'), this.accounts);
    const prefix = R.head(R.map(R.prop('prefix'), this.accounts));
    const pairs = R.zip(hdPathStrings, curAccounts);
    const converter = (0, _tx.addressConverter)(prefix);
    return R.map(([hdPath, account]) => {
      if (isType60(hdPath)) {
        const bech32Address = getEthAddressFromPubkey(account.pubkey, prefix);
        const hexlifyAddress = converter.toHex(bech32Address);
        return R.mergeLeft({
          ethAddress: hexlifyAddress,
          address: bech32Address,
          algo: 'ethsecp256k1'
        }, account);
      }

      return account;
    }, pairs);
  }

}

exports.EthSecp256k1HdWallet = EthSecp256k1HdWallet;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addressConverter = addressConverter;
exports.detectAddressType = detectAddressType;
exports.getEthAddress = void 0;

var _ethereumjsUtil = require("ethereumjs-util");

var _encoding = require("@cosmjs/encoding");

var _ramda = require("ramda");

const R = {
  compose: _ramda.compose,
  equals: _ramda.equals,
  tryCatch: _ramda.tryCatch,
  always: _ramda.always
};

const getEthAddress = privkey => {
  const address = (0, _ethereumjsUtil.privateToAddress)(Buffer.from((0, _encoding.toHex)(privkey), 'hex'));
  return (0, _ethereumjsUtil.toChecksumAddress)('0x' + address.toString('hex'));
};

exports.getEthAddress = getEthAddress;

function hexEncoder() {
  return data => (0, _ethereumjsUtil.toChecksumAddress)(data.toString('hex'));
}

function hexDecoder() {
  return data => {
    const stripped = (0, _ethereumjsUtil.stripHexPrefix)(data);

    if (!(0, _ethereumjsUtil.isValidChecksumAddress)(data) && stripped !== stripped.toLowerCase() && stripped !== stripped.toUpperCase()) {
      throw Error('Invalid address checksum');
    }

    return Buffer.from(stripped, 'hex');
  };
}

function hexConverter() {
  return {
    decoder: hexDecoder(),
    encoder: hexEncoder()
  };
}

function bech32Convert(prefix) {
  return {
    decoder: address => (0, _ethereumjsUtil.toChecksumAddress)('0x' + (0, _encoding.toHex)((0, _encoding.fromBech32)(address).data)),
    encoder: address => (0, _encoding.toBech32)(prefix, address)
  };
}

function addressConverter(prefix) {
  return {
    toHex: address => hexConverter().encoder(bech32Convert(prefix).decoder(address)),
    toBech32: address => bech32Convert(prefix).encoder(hexConverter().decoder(address))
  };
}

function detectAddressType(prefix, address) {
  const converter = addressConverter(prefix);

  const _toHex = R.tryCatch(converter.toHex, R.always(''));

  const _toBech32 = R.tryCatch(converter.toBech32, R.always(''));

  const isHex = R.compose(R.equals(address), _toHex, _toBech32)(address);
  const isBech32 = R.compose(R.equals(address), _toBech32, _toHex)(address);
  return {
    isHex,
    isBech32
  };
}
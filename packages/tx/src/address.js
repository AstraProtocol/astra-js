import {
  toChecksumAddress,
  privateToAddress,
  stripHexPrefix,
  isValidChecksumAddress,
} from 'ethereumjs-util';
import { fromBech32, toBech32, toHex } from '@cosmjs/encoding';
import { compose, equals, tryCatch, always } from 'ramda';
const R = { compose, equals, tryCatch, always };

export const getEthAddress = (privkey) => {
  const address = privateToAddress(Buffer.from(toHex(privkey), 'hex'));
  return toChecksumAddress('0x' + address.toString('hex'));
};

function hexEncoder() {
  return (data) => toChecksumAddress(data.toString('hex'));
}

function hexDecoder() {
  return (data) => {
    const stripped = stripHexPrefix(data);
    if (
      !isValidChecksumAddress(data) &&
      stripped !== stripped.toLowerCase() &&
      stripped !== stripped.toUpperCase()
    ) {
      throw Error('Invalid address checksum');
    }

    return Buffer.from(stripped, 'hex');
  };
}

function hexConverter() {
  return {
    decoder: hexDecoder(),
    encoder: hexEncoder(),
  };
}

function bech32Convert(prefix) {
  return {
    decoder: (address) => toChecksumAddress('0x' + toHex(fromBech32(address).data)),
    encoder: (address) => toBech32(prefix, address),
  };
}

export function addressConverter(prefix) {
  return {
    toHex: (address) => hexConverter().encoder(bech32Convert(prefix).decoder(address)),
    toBech32: (address) => bech32Convert(prefix).encoder(hexConverter().decoder(address)),
  };
}

export function detectAddressType(prefix, address) {
  const converter = addressConverter(prefix);
  const _toHex = R.tryCatch(converter.toHex, R.always(''));
  const _toBech32 = R.tryCatch(converter.toBech32, R.always(''));

  const isHex = R.compose(R.equals(address), _toHex, _toBech32)(address);
  const isBech32 = R.compose(R.equals(address), _toBech32, _toHex)(address);

  return {
    isHex,
    isBech32,
  };
}

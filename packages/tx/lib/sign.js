"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signEthTransaction = exports.sign = exports.fromSerializedTransaction = void 0;

var _amino = require("@cosmjs/amino");

var _encoding = require("@cosmjs/encoding");

var _crypto = require("@cosmjs/crypto");

var _elliptic = require("elliptic");

var _ramda = require("ramda");

var _tx = require("@ethereumjs/tx");

var _common = _interopRequireWildcard(require("@ethereumjs/common"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const R = {
  curry: _ramda.curry,
  unless: _ramda.unless,
  always: _ramda.always,
  length: _ramda.length,
  concat: _ramda.concat,
  is: _ramda.is
};
var curve = null;
const padStart = R.curry((character, length, value) => {
  const _value = R.unless(R.is(String), R.always(''))(value);

  const _character = R.unless(R.is(String), R.always(' '))(character);

  const _length = R.unless(R.is(Number), R.always(0))(length);

  if (R.length(_value) >= _length) return _value;
  return padStart(_character, _length, R.concat(character, _value));
});
const padZeroHexValue = R.curry((length, value) => {
  return padStart('0', length * 2, value);
});

const getCurve = () => {
  if (!curve) curve = new _elliptic.ec('secp256k1');
  return curve;
};

const ecSign = (privKey, message) => {
  var keyPair = getCurve().keyFromPrivate(privKey);
  const serializeData = (0, _amino.serializeSignDoc)(message);
  var signature = keyPair.sign((0, _crypto.keccak256)(serializeData), {
    canonical: true
  });
  return (0, _encoding.fromHex)(R.concat(padZeroHexValue(32, signature.r.toString(16)), padZeroHexValue(32, signature.s.toString(16))));
};

const fromSerializedTransaction = (txData, _chainId) => {
  const isSerialized = R.is(String, txData);
  const chainId = isSerialized ? Number(_chainId || 0) : Number(txData.chainId || 0);

  const common = _common.default.forCustomChain('mainnet', {
    name: 'custom-network',
    networkId: 1,
    chainId
  }, _common.Hardfork.London);

  return isSerialized ? _tx.TransactionFactory.fromSerializedData(Buffer.from(txData, 'hex'), {
    common
  }) : _tx.TransactionFactory.fromTxData(txData, {
    common
  });
};

exports.fromSerializedTransaction = fromSerializedTransaction;

const signEthTransaction = (account, txData, chainId) => {
  const tx = fromSerializedTransaction(txData, chainId);
  const signed = tx.sign(Buffer.from((0, _encoding.toHex)(account.privkey), 'hex'));
  var rlpEncoded = signed.serialize().toString('hex');
  return '0x' + rlpEncoded;
};

exports.signEthTransaction = signEthTransaction;

const sign = (account, signDoc) => {
  const {
    privkey,
    pubkey
  } = account;

  const _signatureBytes = ecSign(privkey, signDoc);

  return {
    signed: signDoc,
    signature: (0, _amino.encodeSecp256k1Signature)(pubkey, _signatureBytes)
  };
};

exports.sign = sign;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodePubkey = encodePubkey;
exports.signAmino = void 0;

var _signing = require("cosmjs-types/cosmos/tx/signing/v1beta1/signing");

var _encoding = require("@cosmjs/encoding");

var _amino = require("@cosmjs/amino");

var _sign = require("./sign");

var _protoSigning = require("@cosmjs/proto-signing");

var _stargate = require("@cosmjs/stargate");

var _math = require("@cosmjs/math");

var _tx = require("cosmjs-types/cosmos/tx/v1beta1/tx");

var _keys = require("cosmjs-types/cosmos/crypto/secp256k1/keys");

var _any = require("cosmjs-types/google/protobuf/any");

var _tx2 = require("cosmjs-types/cosmos/staking/v1beta1/tx");

var _tx3 = require("cosmjs-types/cosmos/bank/v1beta1/tx");

var _tx4 = require("cosmjs-types/cosmos/distribution/v1beta1/tx");

const bankTypes = [['/cosmos.bank.v1beta1.MsgSend', _tx3.MsgSend], ['/cosmos.staking.v1beta1.MsgDelegate', _tx2.MsgDelegate], ['/cosmos.staking.v1beta1.MsgBeginRedelegate', _tx2.MsgBeginRedelegate], ['/cosmos.staking.v1beta1.MsgUndelegate', _tx2.MsgUndelegate], ['/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', _tx4.MsgWithdrawDelegatorReward]];

function encodePubkey(pubkey) {
  const pubkeyProto = _keys.PubKey.fromPartial({
    key: (0, _encoding.fromBase64)(pubkey.value)
  });

  return _any.Any.fromPartial({
    typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
    value: Uint8Array.from(_keys.PubKey.encode(pubkeyProto).finish())
  });
}

const signAmino = (accountFromSigner, messages, fee, memo, {
  accountNumber,
  sequence,
  chainId
}) => {
  const registry = new _protoSigning.Registry([...bankTypes]);
  const aminoTypes = new _stargate.AminoTypes({ ...(0, _stargate.createBankAminoConverters)(),
    ...(0, _stargate.createStakingAminoConverters)('astra'),
    ...(0, _stargate.createDistributionAminoConverters)()
  });
  const pubkey = encodePubkey((0, _amino.encodeSecp256k1Pubkey)(accountFromSigner.pubkey));
  const signMode = _signing.SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
  const signDoc = (0, _amino.makeSignDoc)(messages, fee, chainId, memo, accountNumber, sequence);
  const {
    signature,
    signed
  } = (0, _sign.sign)(accountFromSigner, signDoc);
  const signedTxBody = {
    messages: signed.msgs.map(msg => aminoTypes.fromAmino(msg)),
    memo: signed.memo
  };
  const signedTxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody
  };
  const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject);

  const signedGasLimit = _math.Int53.fromString(signed.fee.gas).toNumber();

  const signedSequence = _math.Int53.fromString(signed.sequence).toNumber();

  const signedAuthInfoBytes = (0, _protoSigning.makeAuthInfoBytes)([{
    pubkey,
    sequence: signedSequence
  }], signed.fee.amount, signedGasLimit, signMode);

  const txRaw = _tx.TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [(0, _encoding.fromBase64)(signature.signature, 'base64')]
  });

  return _tx.TxRaw.encode(txRaw).finish();
};

exports.signAmino = signAmino;
import { AminoTypes } from './amino-types'
import { Registry } from '@cosmjs/proto-signing';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { Any } from "cosmjs-types/google/protobuf/any";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
const signing_1 = require('cosmjs-types/cosmos/tx/signing/v1beta1/signing')
const math_1 = require('@cosmjs/math')
const encoding_1 = require('@cosmjs/encoding')
const proto_signing_1 = require('@cosmjs/proto-signing')
const tx_5 = require('cosmjs-types/cosmos/tx/v1beta1/tx')
export function encodePubkey(pubkey) {
  const pubkeyProto = PubKey.fromPartial({
    key: encoding_1.fromBase64(pubkey.value),
  });
  return Any.fromPartial({
    typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
    value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
  });
}

export const getTxRaw = aminoResponse => {
  const {signature, signed} = aminoResponse;
  const aminoTypes = new AminoTypes();

  const signedTxBody = {
    messages: signed.msgs.map(msg => aminoTypes.fromAmino(msg)),
    memo: signed.memo,
  }
  // console.log(signedTxBody)
  const signedTxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody,
  }
  const registry = new Registry([
    ['/cosmos.bank.v1beta1.MsgSend', MsgSend]
  ]);
  const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject)
  const signedGasLimit = math_1.Int53.fromString(signed.fee.gas).toNumber()
  const signedSequence = math_1.Int53.fromString(signed.sequence).toNumber()
  const pubkey = encodePubkey(signature.pub_key);
  
  // const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
  const signMode = signing_1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON
  const signedAuthInfoBytes = proto_signing_1.makeAuthInfoBytes([{ pubkey, sequence: signedSequence }], signed.fee.amount, signedGasLimit, signMode)
  const txRaw = tx_5.TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [encoding_1.fromBase64(signature.signature)],
  });

  return TxRaw.encode(txRaw).finish();
}

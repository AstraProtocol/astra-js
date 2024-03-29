import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { fromBase64 } from '@cosmjs/encoding';
import { encodeSecp256k1Pubkey, makeSignDoc as makeSignDocAmino } from '@cosmjs/amino';
import { sign } from './sign';
import { makeAuthInfoBytes, Registry } from '@cosmjs/proto-signing';
import {
  AminoTypes,
  createBankAminoConverters,
  createStakingAminoConverters,
  createDistributionAminoConverters,
} from '@cosmjs/stargate';
import { Int53 } from '@cosmjs/math';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { Any } from 'cosmjs-types/google/protobuf/any';
import {
  MsgDelegate,
  MsgBeginRedelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';

const bankTypes = [
  ['/cosmos.bank.v1beta1.MsgSend', MsgSend],
  ['/cosmos.staking.v1beta1.MsgDelegate', MsgDelegate],
  ['/cosmos.staking.v1beta1.MsgBeginRedelegate', MsgBeginRedelegate],
  ['/cosmos.staking.v1beta1.MsgUndelegate', MsgUndelegate],
  ['/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', MsgWithdrawDelegatorReward],
];

const AMINO_TYPES = new AminoTypes({
  ...createBankAminoConverters(),
  ...createStakingAminoConverters('astra'),
  ...createDistributionAminoConverters(),
});

const REGISTRY = new Registry(bankTypes);

const SIGN_MODE = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
export function encodePubkey(pubkey) {
  const pubkeyProto = PubKey.fromPartial({
    key: fromBase64(pubkey.value),
  });
  return Any.fromPartial({
    typeUrl: '/ethermint.crypto.v1.ethsecp256k1.PubKey',
    value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
  });
}

const makeSignBody1  = (
  accountFromSigner,
  messages,
  fee,
  memo,
  { accountNumber, sequence, chainId },
  onSign,
) => {
  const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));
  const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
  const signDoc = makeSignDocAmino(messages, fee, chainId, memo, accountNumber, sequence);
  const signed  = signDoc;
  const signedTxBody = {
    messages: signed.msgs.map(i => AMINO_TYPES.fromAmino(i)),
    memo: signed.memo,
  };
  const signedTxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody,
  };
  const signedTxBodyBytes = REGISTRY.encode(signedTxBodyEncodeObject);
  const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
  const signedSequence = Int53.fromString(signed.sequence).toNumber();
  const signedAuthInfoBytes = makeAuthInfoBytes(
    [{ pubkey, sequence: signedSequence }],
    signed.fee.amount,
    signedGasLimit,
    signMode
  );
  const txRaw = TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [onSign(signDoc)],
  });
  return TxRaw.encode(txRaw).finish();
};

export const makeSimulateBody  = (
  messages,
  memo = '',
  sequence ,
  fee,
  gasLimit
) => {
  const signedTxBody = {
    messages: messages.map(i =>  AMINO_TYPES.fromAmino(i)),
    memo,
  };

  const signedTxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody,
  };
  const signedTxBodyBytes = REGISTRY.encode(signedTxBodyEncodeObject);
  const signedSequence = Int53.fromString(sequence).toNumber();
  const signedAuthInfoBytes = makeAuthInfoBytes([{ sequence: signedSequence }], fee, gasLimit, SIGN_MODE);
  const txRaw = TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [new Uint8Array(64)],
  });
  return TxRaw.encode(txRaw).finish();
};

export const signAmino = (
  accountFromSigner,
  messages,
  fee,
  memo = '',
  { accountNumber, sequence, chainId }
) => {
  return makeSignBody1(
    accountFromSigner,
    messages,
    fee,
    memo, { accountNumber, sequence, chainId },
    (signDoc) => {
      const { signature } = sign(accountFromSigner, signDoc);
      return fromBase64(signature.signature, 'base64')
    }
  )
};



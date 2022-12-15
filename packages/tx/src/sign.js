import { serializeSignDoc, encodeSecp256k1Signature } from '@cosmjs/amino';
import { toHex, fromHex } from '@cosmjs/encoding';
import { keccak256 } from '@cosmjs/crypto';
import { ec } from 'elliptic';
import { curry, unless, always, length, concat, is, join } from 'ramda';
import { TransactionFactory } from '@ethereumjs/tx';
import Common, { Hardfork } from '@ethereumjs/common';

const R = { curry, unless, always, length, concat, is, join };

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
  if (!curve) curve = new ec('secp256k1');
  return curve;
};

const ecSign = (privKey, message) => {
  var keyPair = getCurve().keyFromPrivate(privKey);
  const serializeData = serializeSignDoc(message);

  var signature = keyPair.sign(keccak256(serializeData), { canonical: true });
  return fromHex(
    R.concat(
      padZeroHexValue(32, signature.r.toString(16)),
      padZeroHexValue(32, signature.s.toString(16))
    )
  );
};

function hashMessage(msg) {
  const messageBuffer = Buffer.from(msg, "utf8");
  var preamble = "\x19Ethereum Signed Message:\n" + messageBuffer.length;
  var preambleBuffer = Buffer.from(preamble);
  var ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
  return keccak256(ethMessage);
}

const TxFromStringTxData = (txData) => {
  function sign(privKey) {
    function serialize() {
      const keyPair = getCurve().keyFromPrivate(privKey);
      const signature = keyPair.sign(Buffer.from(hashMessage(txData)), {
        canonical: true,
      });
      return Buffer.from(
        R.join("", [
          padZeroHexValue(32, signature.r.toString(16)),
          padZeroHexValue(32, signature.s.toString(16)),
          Number(27 + signature.recoveryParam).toString(16),
        ]),
        "hex"
      );
    }
    return {
      serialize,
    };
  }
  return {
    sign,
  };
};
const fromSerializedTransaction = (txData, _chainId) => {
  try {
    const isSerialized = R.is(String, txData);
    const chainId = isSerialized ? Number(_chainId || 0) : Number(txData.chainId || 0);
    const common = Common.forCustomChain(
      'mainnet',
      {
        name: 'custom-network',
        networkId: 1,
        chainId,
      },
      Hardfork.London
    );
    return isSerialized
      ? TransactionFactory.fromSerializedData(Buffer.from(txData, 'hex'), { common })
      : TransactionFactory.fromTxData(txData, { common });
  } catch (e) {}


  if (typeof txData === "string") {
    try {
      return TxFromStringTxData(txData);
    } catch (e) {}
  }
};

const signEthTransaction = (account, txData, chainId) => {
  const tx = fromSerializedTransaction(txData, chainId);
  const signed = tx.sign(Buffer.from(toHex(account.privkey), 'hex'));

  var rlpEncoded = signed.serialize().toString('hex');
  return '0x' + rlpEncoded;
};

const sign = (account, signDoc) => {
  const { privkey, pubkey } = account;
  const _signatureBytes = ecSign(privkey, signDoc);

  return {
    signed: signDoc,
    signature: encodeSecp256k1Signature(pubkey, _signatureBytes),
  };
};

export { fromSerializedTransaction, sign, signEthTransaction };

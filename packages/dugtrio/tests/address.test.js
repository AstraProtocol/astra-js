import * as R from 'ramda';
import { fromHex } from '@cosmjs/encoding';
import { Slip10RawIndex } from '@cosmjs/crypto';
import { sign, detectAddressType } from '@astra/tx';
import { EthSecp256k1HdWallet } from '@astra/wallet';

const expectSignature = {
  pub_key: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'AoVQSwSHcyb0R79nYrEFC33tBnLTx8Ojq62w6ouPHXxG',
  },
  signature:
    'FqVrBBD4bYYr0FMcdJGXAca542+UgEiGuVlZjExkda1JRWtNcXo5fBM4oxjpVCLD/jLZ4PO4dFdBlDdz+R9Wiw==',
};

const signDoc = {
  chain_id: 'astra_11110-1',
  account_number: '11055',
  sequence: '13',
  fee: {
    gas: '200000',
    amount: [
      {
        denom: 'aastra',
        amount: '5000',
      },
    ],
  },
  msgs: [
    {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: 'astra1hann2zj3sx3ympd40ptxdmpd4nd4eypm45zhhr',
        to_address: 'astra1hann2zj3sx3ympd40ptxdmpd4nd4eypm45zhhr',
        amount: [
          {
            denom: 'aastra',
            amount: '3570467226624',
          },
        ],
      },
    },
  ],
  memo: '',
};

const fromAccount = {
  privkey: fromHex('79693332602e8c9056615f648cdb066d01ff3535f06b470209bc57d484332cb0'),
  pubkey: fromHex('0285504b04877326f447bf6762b1050b7ded0672d3c7c3a3abadb0ea8b8f1d7c46'),
  address: 'astra1hann2zj3sx3ympd40ptxdmpd4nd4eypm45zhhr',
  ethAddress: '0xBf67350a5181A24D85b5785666EC2DACDb5C903B',
};

describe('Ethereum', function () {
  test('Generate', async function () {
    const prefix = 'astra';
    const hdPath = [
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(60),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.normal(0),
      Slip10RawIndex.normal(0),
    ];
    const mnemonic = 'hotel comfort spatial rely original smoke label card any fish grace surprise';
    const original = await EthSecp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [hdPath],
      prefix: prefix,
    });
    const account = R.head(await original.getAccountsWithPrivkeys());
    expect(account.address).toEqual(fromAccount.address);
    expect(account.ethAddress).toEqual(fromAccount.ethAddress);
  });
  test('Ethereum sign', function () {
    const { signature } = sign(fromAccount, signDoc);
    expect(expectSignature).toEqual(signature);
  });
  test('Public key from address', function () {
    expect(detectAddressType('astra', fromAccount.address)).toEqual({
      isHex: false,
      isBech32: true,
    });
    expect(detectAddressType('astra', fromAccount.ethAddress)).toEqual({
      isHex: true,
      isBech32: false,
    });
    expect(detectAddressType('astra', '')).toEqual({
      isHex: false,
      isBech32: false,
    });
    expect(detectAddressType('astra', null)).toEqual({
      isHex: false,
      isBech32: false,
    });
  });
});

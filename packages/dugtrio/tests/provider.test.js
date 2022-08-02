import { createProvider, validateMnemonic, generateSeed } from '../src';
import axios from 'axios';
import { EthSecp256k1HdWallet } from '@astra/wallet';
import { Slip10RawIndex } from '@cosmjs/crypto';

const chainInfo = {
  name: 'Testnest',
  key: 'testnest',
  chainId: 'astra_11112-1',
  lcdUrl: 'https://api.astranaut.network',
  rpcUrl: 'https://rpc.astranaut.network',
  bech32Prefix: 'astra',
  gasLimit: '200000',
  // gasPrice: '0.001aastra',
  feeAmount: '1000000000000000',
  decimals: '18',
  coinType: '60',
  denom: 'aastra',
};

describe('Provider', function () {
  describe('Wallet', function () {
    test('Address', async function () {
      const hdPath = [
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(60),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(0),
      ];
      const mnemonic =
        'hotel comfort spatial rely original smoke label card any fish grace surprise';
      const wallet = await EthSecp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: [hdPath],
        prefix: 'astra',
      });
      const [{ address }] = await wallet.getAccounts();
      expect(address).toEqual('astra1hann2zj3sx3ympd40ptxdmpd4nd4eypm45zhhr');
    });
  });

  describe('Generate seed', function () {
    test('work', function () {
      expect(generateSeed()).toBeTruthy();
    });
  });

  describe('Validate Mnemonic', function () {
    test('work', function () {
      expect(validateMnemonic(generateSeed())).toBeTruthy();
    });
    test('Unvalid mnemonic', function () {
      expect(validateMnemonic('a b c')).toBeFalsy();
    });
  });

  describe('Provider', function () {
    test('work', function () {
      const _provider = createProvider({ chainInfo, axios });
      expect(_provider).toBeTruthy();
    });
    test('Require chain config', function () {
      expect(createProvider).toThrow(TypeError);
    });
    test('Require chain config', function () {
      expect(createProvider).toThrow(TypeError);
    });
  });
});

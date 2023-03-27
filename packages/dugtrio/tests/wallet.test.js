import { createProvider } from '../src';
import axios from 'axios';
import crypto from 'crypto';
import { storageGenerator } from './storage';
const storage = storageGenerator('data');
const chainInfo = {
  name: 'Testnet',
  key: 'testnet',
  chainId: 'astra_11115-1',
  evmChainId: 11115,
  lcdUrl: 'https://api.astranaut.dev/',
  rpcUrl: 'https://rpc.astranaut.dev',
  bech32Prefix: 'astra',
  gasLimit: '200000',
  gasPrice: '100000000000aastra',
  gasAdjustment: {
    send: 1.3,
    delegate: 1.3,
    'get-reward': 1.3,
    unbond: 1.3,
    're-delegate': 1.3,
  },
  decimals: '18',
  coinType: '60',
  denom: 'aastra',
  unbondingPeriod: '3d',
  erc20Tokens: [
    {
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'owner',
              type: 'address',
            },
          ],
          name: 'balanceOf',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      type: 'erc20',
      coinDenom: 'USDT',
      coinMinimalDenom: 'usdt',
      coinDecimals: 18,
      coinImageUrl:
        'https://salt.tikicdn.com/ts/ta/9d/c3/c2/4420480a5596c4e366a5342f9d7ef87e.png',
      contractAddress: '0x6f74f5511ba144990A8aeBaF20AFBD3B56EedCb2',
    },
  ],
  tokens: [
    {
      denom: 'ASA',
      minimalDenom: 'aastra',
      decimals: 18,
      imageUrl:
        'https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png',
      precision: 2,
    },
    // {
    //   type: 'erc20',
    //   denom: 'USDT',
    //   minimalDenom: 'usdt',
    //   decimals: 18,
    //   imageUrl: 'https://salt.tikicdn.com/ts/ta/9d/c3/c2/4420480a5596c4e366a5342f9d7ef87e.png',
    //   contractAddress: '0x6f74f5511ba144990A8aeBaF20AFBD3B56EedCb2',
    //   precision: 5,
    // },
  ],
  explorer: 'https://explorer.astranaut.dev',
  chainIndexer: 'https://chainindexing.astranaut.dev',
};
function RNG() {
  var privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  return Promise.resolve(privateKey);
}

describe('Wallet', function () {
  let provider;
  beforeEach(async function () {
    provider = createProvider({ RNG, storage, chainInfo, axios, storageGenerator });
    await provider.createMnemonicKeyStore(
      'saddle click spawn install mutual visa usage eyebrow awesome inherit rifle moon giraffe deposit reduce east gossip ice salute hill fire require knife traffic',
      '123456'
    );
    await provider.unlockNewKeystore();
  });
  describe('action', function () {
    test('address', async function () {
      const res = await provider.simulateDelegate('astravaloper1u7gf4z49v53yrxy6ggrzhxfqj46c3ap4tzku46', 111);
      console.log({res});
      expect(res).toHaveProperty('hash');
    });
    // test('send nft', async function () {
    //   const est = await provider.estimateTransferTicket(
    //     "0x1F17093b1c332E9E8E45717a28091c2fe7ba475f",
    //     '8',
    //     '0xBf67350a5181A24D85b5785666EC2DACDb5C903B'
    //   );
    //   console.log(est.gasUsed.toString())
    //   const tx = await provider.transferTicket(
    //     '0x1F17093b1c332E9E8E45717a28091c2fe7ba475f',
    //     '8',
    //     'astra1hann2zj3sx3ympd40ptxdmpd4nd4eypm45zhhr'
    //   );
    //   console.log(tx)
    //   expect(est).toHaveProperty('hash');
    // });
    // test('send big number', async function () {
    //   const tx = await provider.transfer(
    //     'astra19u6ft0g0zldkdewd8t76s2tftzpezly7gx7x7h',
    //     1000000,
    //     'Unit test by Duy Anh'
    //   );
    //   console.log({tx})
    //   expect(tx).toHaveProperty('txHash');
    //   expect(tx).toHaveProperty('tx');
    // });
    // test('send decimal number', async function () {
    //   const tx = await provider.sendEvm(
    //     '0x01a42dD5c8Ccd809AF27F1cD045950a8C8a1f619',
    //     3,
    //     'Unit test by Duy Anh'
    //   );
    //   console.log({tx})
    //   expect(tx).toHaveProperty('txHash');
    //   expect(tx).toHaveProperty('tx');
    // });
    // test('claim reward', async function () {
    //   const tx = await provider.withdrawDelegatorReward(
    //     'astravaloper1zy8cmnacuxl7sh0jkyunzfrz4dfmjc7h8e6wm4',
    //     'Unit test by Duy Anh'
    //   );

    //   expect(tx).toBeTruthy();
    //   expect(tx).toHaveProperty('txHash');
    //   expect(tx).toHaveProperty('logs', []);
    //   expect(tx).toHaveProperty('tx');
    // });
  });
});

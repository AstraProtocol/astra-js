import { createProvider } from '../src';
import axios from 'axios';
import crypto from 'crypto';
import { storageGenerator } from './storage';

const storage = storageGenerator('data');
const chainInfo = {
  name: 'Testnest',
  key: 'testnest',
  chainId: 'astra_11115-2',
  evmChainId: 11115,
  lcdUrl: 'https://api.astranaut.dev',
  rpcUrl: 'https://rpc.astranaut.dev',
  bech32Prefix: 'astra',
  gasLimit: '200000',
  gasPrice: '1000000000aastra',
  decimals: '18',
  coinType: '60',
  denom: 'aastra',
  erc20Tokens: [
    {
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        }
      ],
      type: 'erc20',
      coinDenom: 'USDT',
      coinMinimalDenom: 'usdt',
      coinDecimals: 18,
      coinImageUrl:
        'https://salt.tikicdn.com/ts/ta/9d/c3/c2/4420480a5596c4e366a5342f9d7ef87e.png',
      contractAddress: '0x41591484aEB5FA3d1759f1cbA369dC8dc1281298',
    },
  ]
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
      const address = await provider.getAddress();
      expect(address).toEqual('astra12nnueg3904ukfjel4u695ma6tvrkqvqmrqstx6');
    });
    test('get tx data from hash', async function () {
      const data = await provider.decodeEvmTxData('0x13d70cfcc6fd261bd4715aedc5d646ba132b3923579fa07673404981f5449821');
      expect(data.name).toEqual('swapExactETHForTokens');
    });
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

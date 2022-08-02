import { createProvider } from '../src';
import axios from 'axios';
import crypto from 'crypto';
import { storageGenerator } from './storage';

const storage = storageGenerator('data');
const chainInfo = {
  name: 'Testnest',
  key: 'testnest',
  chainId: 'astra_11112-1',
  lcdUrl: 'https://api.astranaut.network',
  rpcUrl: 'https://rpc.astranaut.network',
  bech32Prefix: 'astra',
  gasLimit: '200000',
  gasPrice: '0.001aastra',
  // feeAmount: '1000000000000000',
  decimals: '18',
  coinType: '60',
  denom: 'aastra',
};
function RNG() {
  var privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  return Promise.resolve(privateKey);
}

describe('Wallet', function () {
  let provider;
  beforeEach(async function () {
    provider = createProvider({ RNG, storage, chainInfo, axios });
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
    test('send big number', async function () {
      const tx = await provider.transfer(
        'astra19u6ft0g0zldkdewd8t76s2tftzpezly7gx7x7h',
        1000000,
        'Unit test by Duy Anh'
      );
      expect(tx).toHaveProperty('txHash');
      expect(tx).toHaveProperty('tx');
    });
    test('claim reward', async function () {
      const tx = await provider.withdrawDelegatorReward(
        'astravaloper1zy8cmnacuxl7sh0jkyunzfrz4dfmjc7h8e6wm4',
        'Unit test by Duy Anh'
      );

      expect(tx).toBeTruthy();
      expect(tx).toHaveProperty('txHash');
      expect(tx).toHaveProperty('logs', []);
      expect(tx).toHaveProperty('tx');
    });
    // test('connect', async function (done) {
    //   console.log(provider.getAccount());
    //   const WC_URI =
    //     'wc:98d54a45a3144774250b8aa579b64e8f513641e719dc30f0c7442985a5f2bba9@2?relay-protocol=waku&symKey=11c098ef0fd15b8d09150c5b3d0667fcb357529586a96330a26f4ca709c68677';

    //   await provider.initSignClient({
    //       projectId: 'd34cb9f3c11ab0a7c8d8ee9275147785',
    //       relayUrl: 'wss://relay.astranaut.network',
    //       metadata: {
    //         name: 'Test Wallet',
    //         description: 'React Wallet for WalletConnect',
    //         url: 'https://walletconnect.com/',
    //         icons: ['https://avatars.githubusercontent.com/u/37784886'],
    //       }
    //   });

    //   const client = provider.getSignClient();
    //   console.log({client})
    //   client.onSessionProposal(async (data) => {
    //     console.log('proposal');
    //     await client.approveProposal(data, provider.getAddress());
    //     console.log('approve ok');
    //   });
    //   client.onSessionRequest(async (data) => {
    //     console.log('onSessionRequest', data)
    //     await client.approveRequest(data, provider.getAccount());
    //     console.log('approve request ok');
    //     done();
    //   });
    //   await client.pair({ uri: WC_URI });
    // }, 100000);
  });
});

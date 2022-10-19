'use strict';

const tx = require('..');
const axios = require('axios');

const account = {
address: "astra19u6ft0g0zldkdewd8t76s2tftzpezly7gx7x7h",
algo: "ethsecp256k1",
ethAddress: "0x2f3495bD0f17Db66e5Cd3aFDa829695883917c9e",
    privkey: new Uint8Array([13, 5, 144, 223, 53, 62, 140, 13, 254, 209, 30, 126, 37, 83, 153, 0, 50, 13, 193, 148, 195, 219, 12, 32, 60, 67, 174, 199, 209, 123, 230, 238]),
    pubkey: new Uint8Array([3, 207, 111, 176, 181, 168, 206, 31, 109, 214, 154, 6, 236, 20, 74, 26, 223, 56, 75, 84, 98, 160, 193, 164, 255, 59, 145, 103, 73, 231, 30, 161, 169])
};
const amount = 1;
const recipient ="astra16aqjlefv8jl5vva6507m6w4nsh72nsv55kqz8m";
const chainInfo = {
    name: 'Testnet',
    key: 'Testnet',
    chainId: 'astra_11115-2',
    lcdUrl: 'https://api.astranaut.dev/',
    rpcUrl: 'https://rpc.astranaut.dev',
    bech32Prefix: 'astra',
    gasLimit: '1200000',
    gasPrice: '25000000000aastra',
    gasAdjustment: {
      send: 1.3,
    },
    decimals: '18',
    coinType: '60',
    denom: 'aastra',
    unbondingPeriod: 2,
  }

describe('@astra/tx', function() {
    let axiosInstance;
    beforeAll(function() {
    axiosInstance= axios.create({ baseURL: chainInfo.lcdUrl });
    });
    test("Tx", async function(){
        const data = await tx.simulateTransfer (axiosInstance, chainInfo, account, recipient,amount, "Duy Anh");
        console.log(data);
        expect(data).toBeTruthy();
    })
});

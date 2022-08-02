import { EthSecp256k1HdWallet } from '@astra/wallet';

describe('Wallet', function () {
  test('Function', function () {
    console.log(EthSecp256k1HdWallet);
    expect(EthSecp256k1HdWallet).toBeTruthy();
  });
});

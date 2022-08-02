import { slice, mergeLeft, equals, map, compose, prop, zip, head, pluck } from 'ramda';
import { toBech32 } from '@cosmjs/encoding';
import { Secp256k1HdWallet } from '@cosmjs/amino';
import { stringToPath, Secp256k1, Keccak256, Bip39, EnglishMnemonic } from '@cosmjs/crypto';
import { addressConverter } from '@astra/tx';
const R = { slice, mergeLeft, map, equals, compose, prop, zip, head, pluck };

const isType60 = (hdPath) => {
  return R.equals(R.slice(0, 2, hdPath), stringToPath("m/44'/60'"));
};

const getEthAddressFromPubkey = (pubkey, prefix) => {
  const uncompressPubkey = Secp256k1.uncompressPubkey(pubkey);
  const hash = new Keccak256(uncompressPubkey.slice(1)).digest();
  const lastTwentyBytes = hash.slice(-20);
  const getAddress = R.compose((_address) => toBech32(prefix, _address), Buffer.from);
  return getAddress(lastTwentyBytes);
};

class EthSecp256k1HdWallet extends Secp256k1HdWallet {
  static async fromMnemonic(mnemonic, options = {}) {
    const mnemonicChecked = new EnglishMnemonic(mnemonic);
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
    return new EthSecp256k1HdWallet(mnemonicChecked, {
      ...options,
      seed: seed,
    });
  }
  static async deserialize(keyStore, password) {
    const wallet = await Secp256k1HdWallet.deserialize(keyStore, password);
    const { accounts, mnemonic } = wallet;
    const { prefix } = R.head(accounts);
    const hdPaths = R.pluck('hdPath', accounts);
    return EthSecp256k1HdWallet.fromMnemonic(mnemonic, { hdPaths, prefix });
  }
  async getAccountsWithPrivkeys() {
    const curAccounts = await super.getAccountsWithPrivkeys();
    const hdPathStrings = R.map(R.prop('hdPath'), this.accounts);
    const prefix = R.head(R.map(R.prop('prefix'), this.accounts));
    const pairs = R.zip(hdPathStrings, curAccounts);
    const converter = addressConverter(prefix);
    return R.map(([hdPath, account]) => {
      if (isType60(hdPath)) {
        const bech32Address = getEthAddressFromPubkey(account.pubkey, prefix);
        const hexlifyAddress = converter.toHex(bech32Address);
        return R.mergeLeft(
          {
            ethAddress: hexlifyAddress,
            address: bech32Address,
            algo: 'ethsecp256k1',
          },
          account
        );
      }
      return account;
    }, pairs);
  }
}

export { EthSecp256k1HdWallet };

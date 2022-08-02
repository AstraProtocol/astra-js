import { defaultTo } from 'ramda';
const R = { defaultTo };

function bip44HDPath(config) {
  const { account, change, addressIndex } = R.defaultTo({}, config);
  return {
    account: account || '0',
    change: change || '0',
    addressIndex: addressIndex || '0',
  };
}

function bip44HDPathToPath(configs, coinType = '60') {
  const { account, change, addressIndex } = R.defaultTo({}, configs);
  return `m/44'/${coinType}'/${account}'/${change}/${addressIndex}`;
}

export { bip44HDPathToPath, bip44HDPath };

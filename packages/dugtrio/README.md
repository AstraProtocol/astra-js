# dugtrio
1. Mnemonic



## Pool
- Get tokens

```
import { getTokenList } from "@tikivn/dugtrio";
/*
  Testnet: 102
  devnet: 103
*/
const tokenList = await getTokenList({chainId: 102})
```

- Get pool
```
import {pool as PoolProvider} from '@tikivn/dugtrio';
const ENDPOINT = 'https://api.testnet.solana.com`;

const mints = [
  "So11111111111111111111111111111111111111112",
  "KyFijt1mMwebiWRoAPyJGfBUpGksgsjQdJCuGyKX44L"
];
const pool = await PoolProvider.getPool(mints, ENDPOINT);
```


- Add liquidity
```
import {pool as PoolProvider} from '@tikivn/dugtrio';
const ENDPOINT = 'https://api.testnet.solana.com`;

const components = [
  {
      "accountAddress": "DFdi6s1v9Vn5BCu3JBX6VYQR37ujYRhcmrsWGpaSG95P",
      "mintAddress": "So11111111111111111111111111111111111111112",
      "amount": 100000000
  },
  {
      "accountAddress": "9Z6i7LSxdZMEF3eE1Jcq3GG6qtZyHWdXjN5ZtQJopJsy",
      "mintAddress": "6EX1U5i4cSVD5SKr7RV2NR1X2UHU8vLjDTPXPfwxKMNB",
      "amount": 422237562.0321538
  }
]

// add both
const {txid, errors} = PoolProvider.addPoolLiquidity(wallet, components, pool, slippage, ENDPOINT)

// or add one 
const {txid, errors} = PoolProvider.addOnePoolLiquidity(wallet, components[0], pool, ENDPOINT);

```


- Swap
```
import {pool as PoolProvider} from '@tikivn/dugtrio';
const ENDPOINT = 'https://api.testnet.solana.com`;

const components = [
  {
      "accountAddress": "DFdi6s1v9Vn5BCu3JBX6VYQR37ujYRhcmrsWGpaSG95P",
      "mintAddress": "So11111111111111111111111111111111111111112",
      "amount": 100000000
  },
  {
      "accountAddress": "9Z6i7LSxdZMEF3eE1Jcq3GG6qtZyHWdXjN5ZtQJopJsy",
      "mintAddress": "6EX1U5i4cSVD5SKr7RV2NR1X2UHU8vLjDTPXPfwxKMNB",
      "amount": 422237562.0321538
  }
]

const {txid, errors} = PoolProvider.swap(wallet, components, slippage, pool, endpoint) {

```


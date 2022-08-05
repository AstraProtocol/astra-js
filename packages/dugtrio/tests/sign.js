import { signEthTransaction } from '@astra/tx';
const swapPayload = {
  chainId: 11112,
  gas: '0x231ab',
  gasPrice: '0x2540be400',
  value: '0xde0b6b3a7640000',
  from: '0x64453f5ebc8a36f0be65e6ec77f3c75182255507',
  to: '0xf6a7620f4fff8197127a1c1c05cb5866bfc5a7ce',
  data: '0x7ff36ab500000000000000000000000000000000000000000000000434bb152206515f55000000000000000000000000000000000000000000000000000000000000008000000000000000000000000064453f5ebc8a36f0be65e6ec77f3c751822555070000000000000000000000000000000000000000000000000000000062c3b20e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000004fdc1fb9c36c855316ba66aaf2dc34aefd68053300000000000000000000000022f1a047857ecbc45e0ca2c554725907af6b204e',
};
const account = {
  privkey: Buffer.from('046853b36b51072e8a30f7dfa92e0a69fc08cd75ae45f78b22013ed67dfecb48', 'hex'),
};
const expectSigned =
  '0xf90154098502540be400830231ab94f6a7620f4fff8197127a1c1c05cb5866bfc5a7ce880de0b6b3a7640000b8e47ff36ab500000000000000000000000000000000000000000000000434bb152206515f55000000000000000000000000000000000000000000000000000000000000008000000000000000000000000064453f5ebc8a36f0be65e6ec77f3c751822555070000000000000000000000000000000000000000000000000000000062c3b20e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000004fdc1fb9c36c855316ba66aaf2dc34aefd68053300000000000000000000000022f1a047857ecbc45e0ca2c554725907af6b204e8256f4a00af2637e7f8fa61fca4f04cf1d2b46b1741156382eef08abfa8fb3f002f9c9d5a039425d5ef10137c0dfed6e4a60a4da759ba01fda8a02d95f2db1cbbf9e843a92';
const signed = signEthTransaction(account, swapPayload);
console.log(signed.serialize().toString('hex'));
console.log(expectSigned);
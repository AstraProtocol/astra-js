import { coins } from '@cosmjs/proto-signing';
import { Uint64 } from '@cosmjs/math';

export const genSignDoc = (amount, currency, recipient, memo, stdFee, signOptions) => ({
  amount,
  currency,
  recipient,
  memo,
  stdFee,
  signOptions,
});

export const actualAmount = (amount, coinDecimals) => {
  // const _amount = Uint64.fromNumber(Number(amount));
  // const _coinDecimals = Uint64.fromNumber(Number(coinDecimals));
  // const tenNumber = Uint64.fromNumber(10);
  // return _amount.data.mul(tenNumber.data.pow(_coinDecimals.data)).toString();
  return String(Number(amount) * 10 ** Number(coinDecimals))
};

export const genMessage = (type) => (address) => (__inputData) => {
  const {
    recipient,
    currency: { coinDecimals, coinMinimalDenom },
    amount,
  } = __inputData;
  return {
    type,
    value: {
      from_address: address,
      to_address: recipient,
      amount: coins(actualAmount(amount, coinDecimals), coinMinimalDenom),
    },
  };
};

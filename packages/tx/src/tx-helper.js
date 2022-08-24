import { Dec, DecUtils } from "@keplr-wallet/unit";
export const genSignDoc = (amount, currency, recipient, memo, stdFee, signOptions) => ({
  amount,
  currency,
  recipient,
  memo,
  stdFee,
  signOptions,
});

export const actualAmount = (amount, coinDecimals) => {
  const dec = new Dec(amount);
  const dec2 = dec.mul(DecUtils.getPrecisionDec(coinDecimals));
  return dec2.truncate().toString();
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
      amount: [{
        amount: actualAmount(amount, coinDecimals),
        denom: coinMinimalDenom
      }]
    },
  };
};

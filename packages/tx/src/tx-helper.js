import { Dec, DecUtils } from "@keplr-wallet/unit";

export const actualAmount = (amount, coinDecimals) => {
  const dec = new Dec(amount);
  const dec2 = dec.mul(DecUtils.getPrecisionDec(coinDecimals));
  return dec2.truncate().toString();
};


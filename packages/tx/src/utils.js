import { calculateFee, GasPrice } from '@cosmjs/stargate';

const _calculateFee = (chainInfo) => {
  const { gasLimit, feeAmount, denom, gasPrice } = chainInfo;
  if (gasPrice) return calculateFee(Number(gasLimit), GasPrice.fromString(gasPrice));
  return {
    gas: gasLimit,
    amount: [
      {
        denom,
        amount: feeAmount,
      },
    ],
  };
};

export { _calculateFee as calculateFee };

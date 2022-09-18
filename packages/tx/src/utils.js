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

const feeSimulate = (gasAdjustment, gasPrice, gasUsed) => {
  return _calculateFee({ gasPrice, gasLimit: Math.floor(gasAdjustment * gasUsed) });
};

export { _calculateFee as calculateFee, feeSimulate };

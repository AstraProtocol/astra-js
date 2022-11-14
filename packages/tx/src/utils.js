import { calculateFee, GasPrice } from '@cosmjs/stargate';
import {Dec, Int} from '@keplr-wallet/unit';
import {BigNumber} from '@ethersproject/bignumber';

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

const numberToHex = (value, decimals = 0) => {
  const dValue = new Dec (String(value)).mul((new Dec('10')).pow(new Int(decimals)));
  return BigNumber.from(dValue.toString(0)).toHexString();
};

export { _calculateFee as calculateFee, feeSimulate, numberToHex };

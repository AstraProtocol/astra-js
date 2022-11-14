import { signEthTransaction } from "./sign";
import { numberToHex } from "./utils";
import { Dec } from '@keplr-wallet/unit';
import { detectAddressType, addressConverter } from './address';

const bench32Hex = (address, prefix) => {
  const { isBech32 } = detectAddressType(prefix, address);
  if (isBech32) {
    return addressConverter(prefix).toHex(address);
  }
  return address;
}

const simulate = async (recipient, amount, account, provider, chainInfo) => {
  const {decimals, bech32Prefix} = chainInfo;
  const _recipient = bench32Hex(recipient, bech32Prefix);
  return {
    gasUsed: await provider.estimateGas({
      from: account.ethAddress,
      to: _recipient,
      value: numberToHex(amount, decimals),
    }),
    gasPrice: await provider.getGasPrice()
  }
}
const sendEvm = async (recipient, amount, account, provider, chainInfo) => {
  const _recipient = bench32Hex(recipient, chainInfo.bech32Prefix);
  const decimals = chainInfo.decimals;
  
  const { gasUsed, gasPrice } = await simulate(_recipient, amount, account, provider, chainInfo)
  console.log(new Dec(gasUsed.mul(gasPrice).toString()))
  const txData = {
    // type: 2,
    // maxPriorityFeePerGas: feeData["maxPriorityFeePerGas"].toHexString(), // Recommended maxPriorityFeePerGas
    // maxFeePerGas: feeData["maxFeePerGas"].toHexString(), // Recommended maxFeePerGas
    chainId: chainInfo.evmChainId,
    from: account.ethAddress,
    to: _recipient,
    value: numberToHex(amount, decimals),
    nonce: await provider.getTransactionCount(account.ethAddress),
    gasLimit: gasUsed.toHexString(),
    gasPrice: gasPrice.toHexString(),
  }
  

  // sign
  const signedTx = signEthTransaction(account, txData);

  const transferTx = await provider.sendTransaction(signedTx);

  return await transferTx.wait()
}
sendEvm.simulate = simulate;
export default sendEvm;
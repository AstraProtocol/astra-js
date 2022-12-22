import { addressConverter, detectAddressType } from '@astra/tx/lib/address';
import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import * as ticketbox from './ticketbox';

const bench32Hex = (address, prefix) => {
  const { isBech32 } = detectAddressType(prefix, address);
  if (isBech32) {
    return addressConverter(prefix).toHex(address);
  }
  return address;
}

// const nfts = [
//   ticketbox
// ];

const transfer = async (contractAddress, nftId, toAddress, provider, account, chainInfo) => {
  const {bech32Prefix} = chainInfo;
  toAddress = bench32Hex(toAddress, bech32Prefix);
  const wallet = new Wallet(account.privkey, provider);
  const _contract = new Contract(contractAddress, ticketbox._abi, wallet);
  const transferTx = await _contract.transferFrom(
    account.ethAddress,
    toAddress,
    nftId
  );
  const receipt = await transferTx.wait();
  return receipt;
}
transfer.estimate = async (contractAddress, nftId, toAddress, provider, account, chainInfo) => {
  const {bech32Prefix} = chainInfo;
  toAddress = bench32Hex(toAddress, bech32Prefix);
  const wallet = new Wallet(account.privkey, provider);
  const _contract = new Contract(contractAddress, ticketbox._abi, wallet);
  const gasUsed = await _contract.estimateGas.transferFrom(
    account.ethAddress,
    toAddress,
    nftId
  );
  return {
    gasUsed,
    gasPrice: await provider.getGasPrice()
  }
}
export { transfer };
import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import * as ticketbox from './ticketbox';

// const nfts = [
//   ticketbox
// ];

const transfer = async (contractAddress, nftId, toAddress, provider, account) => {
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
transfer.estimate = async (contractAddress, nftId, toAddress, provider, account) => {
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
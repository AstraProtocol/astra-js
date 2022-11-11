import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import * as ticketbox from './ticketbox';

const nfts = [
  ticketbox
];


export const transfer = async (contractAddress, nftId, toAddress, provider, account) => {
  const wallet = new Wallet(account.privkey, provider);
  const _contract = new Contract(contractAddress, ticketbox._abi, wallet);
  const transferTx = await _contract.transferFrom(
    account.ethAddress,
    toAddress,
    nftId,
    { gasLimit: 30000000 }
  );
  const receipt = await transferTx.wait();
  return receipt;
}
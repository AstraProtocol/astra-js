import { AccountChangeHandler, Astra, SendTxParams } from "./types/astra";
import { chainInfo } from "./config";
import { broadcastTx, fetchTx, signTx } from "./helpers";

const NO_EXTENSION_ERROR = "Please install Astra Wallet extension";
const getAstraInstance = async (): Promise<Astra | undefined> => {
  if (window.astra) {
    return window.astra;
  }

  if (document.readyState === "complete") {
    return window.astra;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (event.target && (event.target as Document).readyState === "complete") {
        resolve(window.astra);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};

const getAccounts = async () => {
  const astraInstance = await getAstraInstance();
  if (!astraInstance) {
    throw NO_EXTENSION_ERROR;
  }

  await astraInstance.enable(chainInfo.chainId);
  const offlineSigner = astraInstance.getOfflineSigner(chainInfo.chainId);
  const accounts = await offlineSigner.getAccounts();
  return accounts;
};

const getAccountBalance = async (address: string) => {
  const response = await fetch(`${chainInfo.apiEndpoint}/cosmos/bank/v1beta1/balances/${address}`);
  const balance = response.json().then((result) => result.balances[0].amount);
  return balance;
};

let accountsChangeEventHandler: any = null;

const subscribeAccountsChangeEvent = (handler: AccountChangeHandler) => {
  accountsChangeEventHandler = async () => {
    const accounts = await getAccounts();
    handler(accounts);
  };
  window.addEventListener("keplr_keystorechange", accountsChangeEventHandler);
};

const unsubscribeAccountsChangeEvent = () => {
  if (accountsChangeEventHandler) {
    window.removeEventListener("keplr_keystorechange", accountsChangeEventHandler);
  }
};

const sendTx = async ({
  amount,
  senderAddress,
  recipientAddress,
  fee = chainInfo.defaultFee,
  gas = chainInfo.defaultGas,
  memo = "",
}: SendTxParams) => {
  const astraInstance = await getAstraInstance();
  if (!astraInstance) {
    throw NO_EXTENSION_ERROR;
  }

  await astraInstance.enable(chainInfo.chainId);
  const offlineSigner = astraInstance.getOfflineSigner(chainInfo.chainId);
  const signedTx = await signTx(offlineSigner)(senderAddress, recipientAddress, String(amount), memo);
  const txHash = await broadcastTx(signedTx);

  const txHashStr = Buffer.from(txHash).toString("hex").toUpperCase();
  const txLog = await fetchTx(txHashStr);
  if (!txLog) {
    throw new Error("Can't fetch transaction");
  }

  return { transactionHash: txHash };
};

export { getAccounts, getAccountBalance, sendTx, subscribeAccountsChangeEvent, unsubscribeAccountsChangeEvent };

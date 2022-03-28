import {
  assertIsDeliverTxSuccess,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { AccountChangeHandler, Astra, SendTxParams } from "./types/astra";
import { chainInfo } from "./config";

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
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
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
  const response = await fetch(
    `https://api.astra.bar/bank/balances/${address}`
  );
  const balance = response.json().then(({ result }) => result[0].amount);
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
    window.removeEventListener(
      "keplr_keystorechange",
      accountsChangeEventHandler
    );
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
  const finalAmount = {
    denom: chainInfo.denom,
    amount: String(Math.floor(amount * 10 ** chainInfo.currency.coinDecimals)),
  };
  const finalFee = {
    amount: [
      {
        denom: chainInfo.denom,
        amount: String(fee),
      },
    ],
    gas: String(gas),
  };
  const offlineSigner = astraInstance.getOfflineSigner(chainInfo.chainId);
  const client = await SigningStargateClient.connectWithSigner(
    chainInfo.rpcEndpoint,
    offlineSigner
  );
  const result = await client.sendTokens(
    senderAddress,
    recipientAddress,
    [finalAmount],
    finalFee,
    memo
  );
  assertIsDeliverTxSuccess(result);
  return result;
};

export {
  getAccounts,
  getAccountBalance,
  sendTx,
  subscribeAccountsChangeEvent,
  unsubscribeAccountsChangeEvent,
};

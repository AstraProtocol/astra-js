import { makeSignDoc } from "@cosmjs/launchpad";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { cosmos } from "@keplr-wallet/cosmos";
import Long from "long";

import { chainInfo } from "./config";
import { encodePubkey, sleep } from "./utils";

export const fetchAccount = async (address: string) => {
  const response = await fetch(`${chainInfo.apiEndpoint}/auth/accounts/${address}`);
  const data = await response.json();
  const accountNumber = data.result.base_account.account_number;
  const sequence = data.result.base_account.sequence;
  return {
    address,
    accountNumber: `${accountNumber}`,
    sequence: `${sequence}`,
  };
};

export const getActualAmount = (amount: string, coinDecimals: number) => {
  const dec = new Dec(amount);
  const dec2 = dec.mul(DecUtils.getPrecisionDec(coinDecimals));
  return dec2.truncate().toString();
};

export const genMessage = (type: string) => (address: string) => (__inputData: any) => {
  const {
    recipient,
    currency: { coinDecimals, coinMinimalDenom },
    amount,
  } = __inputData;
  return {
    type,
    value: {
      from_address: address,
      to_address: recipient,
      amount: [{ denom: coinMinimalDenom, amount: getActualAmount(amount, coinDecimals) }],
    },
  };
};

export const genMessages = (msgSend: any) => ({
  aminoMsgs: [msgSend],
  protoMsgs: [
    {
      type_url: "/cosmos.bank.v1beta1.MsgSend",
      value: cosmos.bank.v1beta1.MsgSend.encode({
        fromAddress: msgSend.value.from_address,
        toAddress: msgSend.value.to_address,
        amount: msgSend.value.amount,
      }).finish(),
    },
  ],
});

const signOptions = {
  preferNoSetFee: true,
  preferNoSetMemo: true,
};

export const signTx =
  (signer: any) =>
  async (senderAddress: string, recipientAddress: string, amount: string, _memo: string = "") => {
    const accountFromSigner = (await signer.getAccounts()).find((account: any) => account.address === senderAddress);
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const currency = {
      coinMinimalDenom: chainInfo.currency.denom,
      coinDecimals: chainInfo.currency.coinDecimals,
    };
    const fee = {
      gas: String(chainInfo.defaultGas),
      amount: [
        {
          denom: String(chainInfo.currency.denom),
          amount: String(chainInfo.defaultFee),
        },
      ],
    };

    const msgSend = genMessage("cosmos-sdk/MsgSend")(senderAddress)({
      amount,
      currency,
      recipient: recipientAddress,
      memo: _memo,
      stdFee: fee,
      signOptions,
    });

    const msgs = genMessages(msgSend);
    const { aminoMsgs, protoMsgs } = msgs;
    const { accountNumber, sequence } = await fetchAccount(senderAddress);
    const signDoc = makeSignDoc(aminoMsgs, fee, chainInfo.chainId, _memo, accountNumber, sequence);
    const { signature, signed } = await signer.signAmino(senderAddress, signDoc);
    const publicKey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));

    const signerInfos = {
      publicKey: {
        type_url: publicKey.typeUrl,
        value: publicKey.value,
      },
      modeInfo: {
        single: {
          mode: cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        },
      },
      sequence: Long.fromString(signed.sequence),
    };
    const bodyBytes = cosmos.tx.v1beta1.TxBody.encode({
      messages: protoMsgs,
      memo: signed.memo,
    }).finish();
    const authInfoBytes = cosmos.tx.v1beta1.AuthInfo.encode({
      signerInfos: [signerInfos],
      fee: {
        amount: signed.fee.amount,
        gasLimit: Long.fromString(signed.fee.gas),
      },
    }).finish();
    const signedTx = cosmos.tx.v1beta1.TxRaw.encode({
      bodyBytes,
      authInfoBytes,
      signatures: [Buffer.from(signature.signature, "base64")],
    }).finish();

    return signedTx;
  };

export const broadcastTx = async (signedTx: any) => {
  const params = {
    tx_bytes: Buffer.from(signedTx).toString("base64"),
    mode: "BROADCAST_MODE_SYNC",
  };
  const response = await fetch(`${chainInfo.apiEndpoint}/cosmos/tx/v1beta1/txs`, {
    method: "post",
    body: JSON.stringify(params),
  });
  const txResponse = await response.json();
  const txInfo = txResponse?.tx_response || txResponse;
  if (txInfo?.code === 0) {
    const txHash = Buffer.from(txInfo.txhash, "hex");
    return txHash;
  } else {
    throw txInfo.raw_log;
  }
};

export const fetchTx = async (txHash: string, time: number = 10): any => {
  try {
    const response = await fetch(`${chainInfo.apiEndpoint}/cosmos/tx/v1beta1/txs/${txHash}`);

    if (response.status === 200) {
      const data = await response.json();
      return data;
    }
  } catch (error) {}

  if (!time) return;
  await sleep(1000);
  return fetchTx(txHash, time - 1);
};

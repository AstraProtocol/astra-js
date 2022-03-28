import { Keplr } from "@keplr-wallet/types";
import { AccountData } from "@cosmjs/proto-signing";

export interface Astra extends Keplr {}

export interface SendTxParams {
  amount: number;
  senderAddress: string;
  recipientAddress: string;
  fee?: number;
  gas?: number;
  memo?: string;
}

export type AccountChangeHandler = (
  updatedAccounts: readonly AccountData[]
) => void;

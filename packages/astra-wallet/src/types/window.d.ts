import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Astra } from "./astra";

interface AstraWindow {
  astra?: Astra;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends AstraWindow {}
}

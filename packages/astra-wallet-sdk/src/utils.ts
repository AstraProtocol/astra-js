import base64js from "base64-js";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";

export const sleep = (time: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export const fromPartial = (object: any) => {
  const baseAny: any = { typeUrl: "" };
  var _a, _b;
  const message = Object.assign({}, baseAny);
  message.typeUrl = (_a = object.typeUrl) !== null && _a !== void 0 ? _a : "";
  message.value = (_b = object.value) !== null && _b !== void 0 ? _b : new Uint8Array();
  return message;
};

export const fromBase64 = (base64String: string) => {
  if (!base64String.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
    throw new Error("Invalid base64 string format");
  }
  return base64js.toByteArray(base64String);
};

export const toBase64 = (data: any) => {
  return base64js.fromByteArray(data);
};

export const encodePubkey = (pubkey: any) => {
  const pubkeyProto = PubKey.fromPartial({
    key: fromBase64(pubkey.value),
  });
  const typeUrl = "/ethermint.crypto.v1.ethsecp256k1.PubKey";
  return fromPartial({
    typeUrl,
    value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
  });
};

export const encodeSecp256k1Pubkey = (pubkey: any) => {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error("Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03");
  }
  return {
    type: "tendermint/PubKeySecp256k1",
    value: toBase64(pubkey),
  };
};

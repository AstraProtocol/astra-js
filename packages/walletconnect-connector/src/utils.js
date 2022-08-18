import {
  toChecksumAddress,
  stripHexPrefix,
  isValidChecksumAddress,
} from 'ethereumjs-util';
import { fromBech32, toBech32, toHex } from '@cosmjs/encoding';

function hexEncoder() {
  return (data) => toChecksumAddress(data.toString('hex'));
}

function hexDecoder() {
  return (data) => {
    const stripped = stripHexPrefix(data);
    if (
      !isValidChecksumAddress(data) &&
      stripped !== stripped.toLowerCase() &&
      stripped !== stripped.toUpperCase()
    ) {
      throw Error('Invalid address checksum');
    }

    return Buffer.from(stripped, 'hex');
  };
}

function hexConverter() {
  return {
    decoder: hexDecoder(),
    encoder: hexEncoder(),
  };
}

function bech32Convert(prefix) {
  return {
    decoder: (address) => toChecksumAddress('0x' + toHex(fromBech32(address).data)),
    encoder: (address) => toBech32(prefix, address),
  };
}

export function addressConverter(prefix) {
  return {
    toHex: (address) => hexConverter().encoder(bech32Convert(prefix).decoder(address)),
    toBech32: (address) => bech32Convert(prefix).encoder(hexConverter().decoder(address)),
  };
}

export function detectAddressType(prefix, address) {
  const converter = addressConverter(prefix);
  const toHex = address => {
    try {
      return converter.toHex(address);
    } catch {
      return '';
    }
  }
  const toBech32 = address => {
    try {
      return converter.toBech32.toHex(address);
    } catch {
      return '';
    }
  }
  const isHex = address === toHex(address);
  const isBech32 = address === toBech32(address);

  return {
    isHex,
    isBech32,
  };
}

class RequestError extends Error {
  constructor(message, code, data) {
    super()
    this.name = this.constructor.name
    this.message = message
    this.code = code
    this.data = data
  }
}
function generateUUID() {
  let d = new Date().getTime()
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0 // Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 // random number between 0 and 16
    if (d > 0) {
      // Use timestamp until depleted
      // eslint-disable-next-line no-bitwise
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      // Use microseconds since page-load if supported
      // eslint-disable-next-line no-bitwise
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
export const createRequest = (url) => {
  return async (method, params) => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: generateUUID(),
        method,
        params,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) throw new RequestError(`${response.status}: ${response.statusText}`, -32000)
    const body = await response.json()
    if ('error' in body) {
      throw new RequestError(body?.error?.message, body?.error?.code, body?.error?.data)
    } else if ('result' in body) {
      return body.result
    } else {
      throw new RequestError(`Received unexpected JSON-RPC response to ${method} request.`, -32000, body)
    }
  }
}
export const convertToHex = address => {
  const prefix = 'astra';
  const { isBech32 } = detectAddressType(prefix, address);
  if (isBech32) {
    return addressConverter(prefix).toHex(address);
  } 
  return address;
}
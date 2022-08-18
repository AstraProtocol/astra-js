
import {
  addressConverter,
  detectAddressType,
} from '@astra/tx';

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
import { generateUUID } from './utils'

class RequestError extends Error {
  constructor(message, code, data) {
    super()
    this.name = this.constructor.name
    this.message = message
    this.code = code
    this.data = data
  }
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

export const astra = (target) => {
  return target.astra
}

export const cosmosChainId = (chainId) => {
  return `astra_${chainId}`
}

export class MiniRpcProvider {
  constructor(chainId, url, mappers, myAstra) {
    this.chainId = chainId
    this.url = url
    console.log(this.url)
    const parsed = new URL(url)
    this.host = parsed.host
    this.path = parsed.pathname
    this.myAstra = myAstra
    this.mappers = mappers
    this.http = createRequest(this.url)
    this.isMetaMask = false
  }

  updateBechAddress(bech32Address) {
    this.bechAddress = bech32Address
  }

  sendAsync(request = {}, callback) {
    const { id, method, params } = request

    this.request(method, params)
      .then((result) => callback(null, { jsonrpc: '2.0', id, result }))
      .catch((error) => callback(error, null))
  }

  async request(method, params) {
    const _params = typeof method !== 'string' ? method.params : params
    const _method = typeof method !== 'string' ? method.method : method
    if (this.mappers[_method]) return this.mappers[_method]
    if (_method === 'eth_sendTransaction') {
      const [txData] = _params
      const nonce = await this.http('eth_getTransactionCount', [txData.from, 'latest'])
      const data = JSON.stringify({ ...txData, nonce, chainId: this.chainId })
      const signedData = await this.myAstra.signEthereum(
        cosmosChainId(this.chainId),
        this.bechAddress,
        data,
        'transaction',
      )
      const buffer = Buffer.from(signedData)
      const bufString = `0x${buffer.toString('hex')}`
      return this.sendRawTransaction(bufString)
    }
    return this.http(_method, _params)
  }

  async sendRawTransaction(data) {
    return this.http('eth_sendRawTransaction', [data])
  }
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

export function generateUUID() {
  let d = new Date().getTime()
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0 // Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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

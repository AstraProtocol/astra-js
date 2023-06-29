import { AbstractConnector } from '@web3-react/abstract-connector'
import { createRequest } from './utils'
import { RELAY_URL, QRCodeModal, SignClient } from '@astra-sdk/wallet-connect';


const WC_CHAINID = `astra:astra-`

const RELAY = `ws://${RELAY_URL}`

class WalletConnectProvider {
  constructor(chainId, url, mappers, client, walletconnectChainId) {
    this.chainId = chainId
    this.url = url
    const parsed = new URL(url)
    this.host = parsed.host
    this.path = parsed.pathname
    this.client = client
    this.walletconnectChainId = walletconnectChainId
    this.mappers = mappers
    this.isMetaMask = false
    this.http = createRequest(this.url)
  }

  updateSession(session) {
    this.session = session
  }

  sendAsync(request = {}, callback) {
    const { id, method, params } = request

    this.request(method, params)
      .then((result) => callback(null, { jsonrpc: '2.0', id, result }))
      .catch((error) => callback(error, null))
  }

  async sendWCRequest(payload) {
    if (!this.client) {
      throw new NoClient()
    }

    const result = await this.client.request({
      topic: this.session?.topic,
      chainId: this.walletconnectChainId,
      request: {
        method: 'signEth',
        params: payload,
      },
    })

    return result
  }

  async request(method, params) {
    const _params = typeof method !== 'string' ? method.params : params
    const _method = typeof method !== 'string' ? method.method : method
    if (this.mappers[_method]) return this.mappers[_method]
    if (_method === 'eth_sendTransaction') {
      const [txData] = _params
      const nonce = await this.http('eth_getTransactionCount', [txData.from, 'latest'])
      const signedData = await this.sendWCRequest({ ...txData, nonce, chainId: this.chainId })
      return this.sendRawTransaction(signedData)
    }
    return this.http(_method, _params)
  }

  async sendRawTransaction(data) {
    return this.http('eth_sendRawTransaction', [data])
  }
}

export class NoClient extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'Client is not initialized!'
  }
}

export class UserRejectedRequestError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class WalletConnectConnector extends AbstractConnector {
  constructor({ url, chainId, network = 'testnet' }) {
    super({ supportedChainIds: [chainId] })

    this.walletconnectChainId = `${WC_CHAINID}${network}`
    this.url = url
    this.chainId = chainId
    this.account = null
    this.mappers = {
      eth_chainId: chainId,
    }
    this.setupSuccess = false
  }

  async setup({
    relayUrl = RELAY,
    projectId = '',
    metadata = {},
    logger
  }) {
    const client = await SignClient.init({
      projectId,
      relayUrl,
      logger,
      metadata,
    })

    this.client = client

    if (client.session.length > 0) {
      const lastKeyIndex = client.session.keys.length - 1
      const session = client.session.get(client.session.keys[lastKeyIndex])
      this.updateSession(session)
    }

    // Add listeners for desired SignClient events
    client.on('session_event', () => {
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
    })

    client.on('session_update', ({ topic, params }) => {
      const { namespaces } = params
      const _session = client.session.get(topic)
      // Overwrite the `namespaces` of the existing session with the incoming one.
      const updatedSession = { ..._session, namespaces }
      // Integrate the updated session state into your dapp state.
      this.updateSession(updatedSession)
    })

    client.on('session_delete', () => {
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
      this.session = null;
      this.emitDeactivate();
    })
    this.setupSuccess = true
  }

  updateSession(session) {
    this.session = session
    const allNamespaceAccounts = Object.values(session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat()
    const addresses = allNamespaceAccounts.map((str) => str.split(':')[2])
    this.account = addresses?.[0]
    this.provider = new WalletConnectProvider(this.chainId, this.url, this.mappers, this.client, this.walletconnectChainId)
    this.provider.updateSession(session)
  }

  async activate() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!this.client) {
        return reject(new NoClient())
      }

      if (this.account) {
        return resolve({ provider: this.provider, chainId: this.chainId, account: this.account })
      }

      const { uri, approval } = await this.client.connect({
        pairingTopic: undefined, // set pairingTopic with topic if you want to connect to a existed pairing
        requiredNamespaces: {
          astra: {
            chains: [this.walletconnectChainId],
            events: [],
            methods: ['sign', 'signEth'], // sign method defined in AstraWallet
          },
        },
      })

      // use uri to show QRCode
      if (uri) {
        QRCodeModal.open(
          uri,
          () => {
            reject(new Error('QR Code Modal closed'))
          },
          {
            mobileLinks: [],
            desktopLinks: [],
          },
        )
      }
      const session = await approval()
      QRCodeModal.close()
      if (session) {
        this.updateSession(session)
        return resolve({ provider: this.provider, chainId: this.chainId, account: this.account })
      }

      return reject(new UserRejectedRequestError())
    })
  }

  // eslint-disable-next-line class-methods-use-this
  async getProvider() {
    return this.provider
  }

  // eslint-disable-next-line class-methods-use-this
  async getChainId() {
    return this.chainId
  }

  async getAccount() {
    return this.account
  }

  async deactivate() {
    this.account = null

    if (this.client && this.session) {
      this.client.disconnect({
        topic: this.session?.topic,
        reason: '',
      })
    }
  }

  async isAuthorized() {
    if (!this.provider) {
      return false
    }
    return true
  }
}

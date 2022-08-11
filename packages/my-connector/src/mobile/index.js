import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import warning from 'tiny-warning'
import { astra, cosmosChainId,  MiniRpcProvider } from './utils'

export class NoAstraProviderError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Astra provider was found on window.astra.'
  }
}

export class UserRejectedRequestError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class AstraConnector extends AbstractConnector {

  constructor({ url, chainId }) {
    super({ supportedChainIds: [chainId] });

    this.chainId = chainId;

    const mappers = {
      eth_chainId: chainId,
    };
    
    this.myAstra = astra(window);
    this.provider = new MiniRpcProvider(chainId, url, mappers, this.myAstra);
  }


  async activate() {
    if (!this.myAstra) {
      throw new NoAstraProviderError()
    }
    // try to activate + get account via eth_requestAccounts
    let account
    try {
      await this.myAstra.enable(cosmosChainId(this.chainId))
      const key = await this.myAstra.getKey(cosmosChainId(this.chainId))
      const buffer = Buffer.from(key.address)
      this.provider.updateBechAddress(key.bech32Address)
      account = `0x${buffer.toString('hex')}`
    } catch (error) {
      if (error.code === 4001) {
        throw new UserRejectedRequestError()
      }
      warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable')
    }

    return { provider: this.provider, chainId: this.chainId, account }
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
    if (!this.provider) {
      throw new NoAstraProviderError()
    }
    // try to activate + get account via eth_requestAccounts
    let account
    try {
      await this.myAstra.enable(cosmosChainId(this.chainId))
      const key = await this.myAstra.getKey(cosmosChainId(this.chainId))
      this.provider.updateBechAddress(key.bech32Address)
      const buffer = Buffer.from(key.address)
      account = `0x${buffer.toString('hex')}`
    } catch (error) {
      if (error.code === 4001) {
        throw new UserRejectedRequestError()
      }
      warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable')
    }
    return account
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  deactivate() {}

  async isAuthorized() {
    if (!this.provider) {
      return false
    }

    try {
      await this.myAstra.enable(cosmosChainId(this.chainId))
      return true
    } catch {
      return false
    }
  }
}

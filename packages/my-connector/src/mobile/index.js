import { AbstractConnector } from '@web3-react/abstract-connector'
import { astra, cosmosChainId,  generateUUID,  MiniRpcProvider } from './utils'

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

  static async create({ chainId, url, metadata }) {
    const connector = new AstraConnector({
      url,
      chainId,
      metadata
    });
    await connector.setup();
    return connector;
  }

  constructor({ url, chainId, metadata }) {
    super({ supportedChainIds: [chainId] });

    this.chainId = chainId;
    this.metadata = metadata;

    const mappers = {
      eth_chainId: chainId,
    };
    this.setupSuccess = false;
    this.myAstra = astra(window);
    this.myAstra.setMetadata({
      ...metadata,
      uuid: generateUUID(),
    });
    this.provider = new MiniRpcProvider(chainId, url, mappers, this.myAstra);
  }

  async setup() {
    try {
      await this.myAstra.enable(cosmosChainId(this.chainId))
      const key = await this.myAstra.getKey(cosmosChainId(this.chainId))
      const buffer = Buffer.from(key.address)
      this.provider.updateBechAddress(key.bech32Address)
      this.account = `0x${buffer.toString('hex')}`
      this.setupSuccess = true;
    } catch (error) {
      if (error.code === 4001) {
        throw new UserRejectedRequestError()
      }
    }
  }

  async activate() {
    if (!this.myAstra || !this.setupSuccess) {
      throw new NoAstraProviderError()
    }
    return { provider: this.provider, chainId: this.chainId, account: this.account };
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

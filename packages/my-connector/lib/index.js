"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AstraWalletConnector = void 0;

var _abstractConnector = require("@web3-react/abstract-connector");

var _request = require("./request");

var _utils = require("./utils");

class MiniRpcProvider {
  constructor(chainId, url, mappers, myModule) {
    this.chainId = chainId;
    this.url = url;
    const parsed = new URL(url);
    this.host = parsed.host;
    this.path = parsed.pathname;
    this.myModule = myModule;
    this.mappers = mappers;
    this.http = (0, _request.createRequest)(this.url);
    this.isMetaMask = false;
  }

  sendAsync(request = {}, callback) {
    const {
      id,
      method,
      params
    } = request;
    this.request(method, params).then(result => callback(null, {
      jsonrpc: '2.0',
      id,
      result
    })).catch(error => callback(error, null));
  }

  async request(method, params) {
    const _params = typeof method !== 'string' ? method.params : params;

    const _method = typeof method !== 'string' ? method.method : method;

    if (this.mappers[_method]) return this.mappers[_method];

    if (_method === 'eth_sendTransaction') {
      const [txData] = _params;
      const nonce = await this.http('eth_getTransactionCount', [txData.from, 'latest']);
      const signedData = await this.myModule({
        method: 'eth_signTransaction',
        params: [{ ...txData,
          nonce
        }]
      });
      return this.sendRawTransaction(signedData);
    }

    return this.http(_method, _params);
  }

  async sendRawTransaction(data) {
    return this.http('eth_sendRawTransaction', [data]);
  }

}

class AstraWalletConnector extends _abstractConnector.AbstractConnector {
  constructor({
    url,
    chainId
  }) {
    super({
      supportedChainIds: [chainId]
    });
    this.chainId = chainId;
    const mappers = {
      eth_chainId: chainId
    };
    this.setupSuccess = false;
    this.myModule = (0, _utils.promiseAppMessage)(window);
    this.provider = new MiniRpcProvider(chainId, url, mappers, this.myModule);
  }

  static async create({
    chainId,
    url
  }) {
    const connector = new AstraWalletConnector({
      url,
      chainId
    });
    await connector.setup();
    return connector;
  }

  async setup() {
    try {
      await this.myModule({
        method: 'eth_setup',
        params: [this.provider.chainId, this.provider.url, {
          name: 'Astra Defi',
          icon: 'https://defi.astranaut.network/images/astra.svg',
          location: 'https://defi.astranaut.network'
        }]
      });
      this.account = await this.myModule({
        method: 'eth_getAddress'
      });
      this.setupSuccess = true;
    } catch (e) {
      console.log(e);
    }
  }

  async activate() {
    if (!this.setupSuccess) {
      const error = new Error('Not supported');
      error.name = 'Astra Wallet Provider';
      throw error;
    }

    return {
      provider: this.provider,
      chainId: this.chainId,
      account: this.account
    };
  }

  async getProvider() {
    return this.provider;
  }

  async getChainId() {
    return this.chainId;
  }

  async getAccount() {
    return this.account;
  }

  deactivate() {
    return;
  }

  changeChainId() {}

}

exports.AstraWalletConnector = AstraWalletConnector;
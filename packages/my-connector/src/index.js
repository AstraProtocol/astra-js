import { checkContext } from './utils';
import { AstraWalletConnector as MyAstraWalletConnector } from './my';
import { AstraConnector  } from './mobile';

export class AstraWalletConnector  {
  constructor(){}

  static async create({ chainId, url }) {
    try {
      const context = await checkContext(window);
      if(context.isMy) {
        const connector = new MyAstraWalletConnector ({
          url,
          chainId,
        });
        await connector.setup();
        return connector;
      }
      if(context.isAstra) {
        const connector = new AstraConnector({ url, chainId });\
        await connector.setup();
        return connector;
      }
    } catch (e) {
      console.log(e);
    }
    return new AstraWalletConnector();
  }

  async activate() {
    const error = new Error('Not supported');
    error.name = 'Astra Wallet Provider';
    throw error;
  }

  async getProvider() {
    return null;
  }

  async getChainId() {
    return null;
  }

  async getAccount() {
    return null;
  }

  deactivate() {
    return;
  }

  changeChainId() {}
}

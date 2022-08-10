import { checkContext } from './utils';
import { AstraWalletConnector as MyAstraWalletConnector } from './my';
import { AstraConnector  } from './mobile';



export class AstraWalletConnector  {
  static async create({ chainId, url }) {
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
      return new AstraConnector({ url, chainId });
    }
    return null;
  }
}

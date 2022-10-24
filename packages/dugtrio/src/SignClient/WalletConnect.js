import { makeSignDoc } from '@cosmjs/amino';
import SignClient from '@walletconnect/sign-client';
import { getSdkError } from '@walletconnect/utils';
import { sign, signEthTransaction } from '@astra/tx';
import { mergeLeft } from 'ramda';
import { KEY as STORAGE_KEY } from './KeyValueStorage';

const _sign = (accountFromSigner, messages, fee, memo, { accountNumber, sequence, chainId }) => {
  console.log(0, fee)
  const signDoc = makeSignDoc(messages, fee, chainId, memo, accountNumber, sequence);
  console.log(1, signDoc)
  return sign(accountFromSigner, signDoc);
};

export const init = async (signClientOptions, stream) => {
  const self = {
    stream: null,
    client: null,
    destroyed: false,
    removeSessionProposalCallback: () => { },
    removeSessionRequestCallback: () => { },
    removeSessionDeleteCallback: () => { },
  };

  self.client = await SignClient.init({
    ...signClientOptions,
  });

  self.stream = stream;

  self.client.on('session_proposal', _onSessionProposal);
  self.client.on('session_request', _onSessionRequest);
  self.client.on('session_delete', _onSessionDelete);
  // TODOs
  self.client.on('session_ping', (data) => console.log('ping', data));
  self.client.on('session_event', (data) => console.log('event', data));
  self.client.on('session_update', (data) => console.log('update', data));

  function destroy() {
    self.destroyed = true;
    self.removeSessionProposalCallback()
    self.removeSessionRequestCallback()
    self.removeSessionDeleteCallback()
    my.offSocketMessage();
    my.offSocketOpen();
    my.offSocketError();
    my.closeSocket();
  }

  function _onSessionProposal(data) {
    if(!self.destroyed) {
      self.stream.invoke('sessionProposal', data);
    }
  }
  function _onSessionRequest(data) {
    if(!self.destroyed) {
      self.stream.invoke('sessionRequest', data);
    }
  }
  function _onSessionDelete(data) {
    if(!self.destroyed) {
      self.stream.invoke('sessionDelete', data);
    }
  }

  function onSessionProposal(callback) {
    self.removeSessionProposalCallback = self.stream.register('sessionProposal', callback);
    return self.removeSessionProposalCallback;
  }

  function onSessionRequest(callback) {
    self.removeSessionRequestCallback = self.stream.register('sessionRequest', callback);
    return self.removeSessionRequestCallback;
  }

  function onSessionDelete(callback) {
    self.removeSessionDeleteCallback = self.stream.register('sessionDelete', callback);
    return self.removeSessionDeleteCallback;
  }

  function disconnect({ topic, reason }) {
    try {
      return self.client.disconnect({ topic, reason });
    } catch(e) {
      // try to remove 
      self.client.session.delete(topic, getSdkError("USER_DISCONNECTED"));
      self.client.core.crypto.deleteSymKey(topic);
      self.client.expirer.del(topic);
      console.log('disconnect error', e);
    }
  }

  const pair = async ({ uri }) => {
    await self.client.pair({ uri });
  };

  const approveProposal = async (proposal, address) => {
    const approvePayload = {
      id: proposal.id,
      relayProtocol: proposal.params.relays[0].protocol,
      namespaces: {
        astra: {
          accounts: ['astra:astra-testnet:' + address],
          methods: proposal.params.requiredNamespaces['astra'].methods,
          events: proposal.params.requiredNamespaces['astra'].events,
        },
      },
    };
    const { acknowledged } = await self.client.approve(approvePayload);
    await acknowledged();
  };

  const rejectProposal = async (proposal) => {
    const { id } = proposal;
    return self.client.reject({
      id,
      reason: getSdkError('USER_REJECTED_METHODS'),
    });
  };

  const getSessions = async () => {
    return self.client.session.values;
  };

  const approveRequest = async (requestEvent, account) => {
    const { params, topic, id } = requestEvent;
    const {
      request: {
        method, // sign | signEth
        params: txData,
      },
    } = params;

    if(method === 'sign') {
      const { messages, fee, memo, signerData } = txData;
      const result = _sign(account, messages, fee, memo, signerData);
  
      await self.client.respond({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result,
        },
      });
    } else if (method === 'signEth') {
      const {chainId, ...txRest} = txData;
      const result = signEthTransaction(
        account,
        mergeLeft({ gasLimit: txRest.gas, chainId }, txRest),
        chainId
      );
  
      await self.client.respond({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result,
        },
      });
    }


  };

  const rejectRequest = async (requestEvent) => {
    const { topic, id } = requestEvent;
    return self.client.respond({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        error: getSdkError('USER_REJECTED_METHODS').message
      },
    });
  };

  const clear = () => {
    // self.client.core.relayer.provider.close();
    my.removeStorage({
      key: STORAGE_KEY,
    });
    // self.stream.invoke('sessionProposal', []);
    // self.stream.invoke('sessionRequest', []);
  };

  return {
    clear,
    pair,
    approveProposal,
    rejectProposal,
    approveRequest,
    rejectRequest,
    getSessions,
    disconnect,
    onSessionProposal,
    onSessionRequest,
    onSessionDelete,
    destroy
  };
};

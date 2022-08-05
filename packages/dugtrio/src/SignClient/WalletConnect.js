import { makeSignDoc } from '@cosmjs/amino';
import SignClient from '@walletconnect/sign-client';
import { ERROR } from '@walletconnect/utils';
import { sign, signAmino } from '@astra/tx';

import { KEY as STORAGE_KEY } from './KeyValueStorage';
const _sign = (accountFromSigner, messages, fee, memo, { accountNumber, sequence, chainId }) => {
  const signDoc = makeSignDoc(messages, fee, chainId, memo, accountNumber, sequence);
  return sign(accountFromSigner, signDoc);
};
export const init = async (signClientOptions, stream) => {
  const self = {
    stream: null,
    client: null,
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

  function _onSessionProposal(data) {
    self.stream.invoke('sessionProposal', data);
  }
  function _onSessionRequest(data) {
    self.stream.invoke('sessionRequest', data);
  }
  function _onSessionDelete(data) {
    self.stream.invoke('sessionDelete', data);
  }

  function onSessionProposal(callback) {
    return self.stream.register('sessionProposal', callback);
  }

  function onSessionRequest(callback) {
    return self.stream.register('sessionRequest', callback);
  }

  function onSessionDelete(callback) {
    return self.stream.register('sessionDelete', callback);
  }

  function disconnect({ topic, reason }) {
    return self.client.disconnect({ topic, reason });
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
      reason: ERROR.JSONRPC_REQUEST_METHOD_REJECTED.format(),
    });
  };

  const getSessions = async () => {
    return self.client.session.values;
  };
  const approveRequest = async (requestEvent, account) => {
    const { params, topic, id } = requestEvent;
    const {
      request: {
        params: { messages, fee, memo, signerData },
      },
    } = params;

    const result = _sign(account, messages, fee, memo, signerData);

    await self.client.respond({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        result,
      },
    });
  };

  const rejectRequest = async (requestEvent) => {
    const { topic, id } = requestEvent;
    return self.client.respond({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        error: ERROR.JSONRPC_REQUEST_METHOD_REJECTED.format().message,
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
  };
};
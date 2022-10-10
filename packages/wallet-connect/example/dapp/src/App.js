import './App.css';
import {
  Button, Card, Form, Input, message, Select
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import SignClient from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import axios from 'axios';
import _ from 'lodash';
import { getTxRaw, hex2Bech32 } from './utils';

const DENOM = 'aastra';
const GAS_LIMIT = 200000;
const GAS_PRICE = 1000000000; // aastra
const NETWORKS = [
  {
    name: 'Testnet',
    key: 'testnet',
    rpc: 'https://rpc.astranaut.dev',
    api: 'https://api.astranaut.dev',
    chainId: 'astra_11115-1'
  },
  {
    name: 'Mainnet',
    key: 'mainnet',
    rpc: 'https://rpc.astranaut.dev',
    api: 'https://api.astranaut.dev',
    chainId: 'astra_11115-1'
  }
];
const NETWORK_PREFIX = 'astra-';


const PROTOCOL = 'ws://'; // Swith to wss in production
const getAccountNumberAndSequence = async (address, api) => {
  try {
    const res = await axios({
      url: api + '/auth/accounts/' + address
    })
    return {
      account_number: _.get(res, 'data.result.base_account.account_number'),
      sequence: _.get(res, 'data.result.base_account.sequence', 0),
    }
  } catch(e) {
    return {};
  }
};

const TransferForm = props => {
  const { onSubmit, loading } = props;
  
  const onFinish = (values) => {
    console.log(props)
    onSubmit(values)
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return <Form
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
    >

    <b>Transfer</b>
    <Form.Item
      label="To address"  
      name="address"
      rules={[{ required: true, message: 'Please input address!' }]} 
    >
      <Input />
    </Form.Item>
    <Form.Item
      label="Amount"  
      name="amount"
      type="number"
      rules={[{ required: true, message: 'Please input amount!' }]} 
    >
      <Input />
    </Form.Item>
    <div style={{textAlign: 'center'}}>
      <Button loading={loading} htmlType="submit" type="primary">Submit</Button>
    </div>
  </Form>
}

function App() {
  
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState(null);
  const [session, setSession] = useState(null);

  const connected = !!address;

  const onChangeNetwork = useCallback((key) => {
    setNetwork(NETWORKS.find(n => n.key === key));
  }, []);

  const updateSession = useCallback((session) => {
    console.log({session})
    const allNamespaceAccounts = Object.values(session.namespaces)
      .map(namespace => namespace.accounts)
      .flat();
    const addresses = allNamespaceAccounts.map(str => str.split(':')[2]);
    const networks = allNamespaceAccounts.map(str => str.split(':')[1].substring(NETWORK_PREFIX.length));
    onChangeNetwork(networks[0]);
    // To sign in cosmos, you need to convert hex address to bech32 address
    setAddress(hex2Bech32(addresses?.[0]));
    setSession(session);
    console.log({session})
  }, [onChangeNetwork]);

  const connect = useCallback(async (topic) => {
    
    const { uri, approval } = await client.connect({
      pairingTopic: topic, // set pairingTopic with topic if you want to connect to a existed pairing
      requiredNamespaces: {
        astra: {
          chains: [`astra:${NETWORK_PREFIX}${network.key}`],
          events: [],
          methods: ["sign"], // sign method defined in AstraWallet
        },
      },
    });
    
    // use uri to show QRCode
    if (uri) {
      QRCodeModal.open(uri, () => {
        console.log("EVENT", "QR Code Modal closed");
      }, {
        mobileLinks: [],
        desktopLinks: []
      });
    }
     
    const session = await approval();
    if(session) {
      updateSession(session);
    }

    QRCodeModal.close();

  }, [client, network, updateSession]);

  const disconnect = useCallback(async (e) => {
    await client.disconnect({
      topic: session.topic,
      reason: '',
    });
    setAddress(null);
    setSession(null);
  }, [client, session?.topic]);

  useEffect(() => {
    (async () => {
      const client = await SignClient.init({
        relayUrl: 'ws://wc-relay.astranaut.dev',
        metadata: {
          name: 'DEMO DAPP',
          description: 'Demo to connect via Wallet Connect',
          url: window.location.origin,
          icons: [
            `${window.location.origin}/logo192.png`
          ],
        },
      });
      
      // Restore current session
      if (client.session.length > 0) {
        const lastKeyIndex = client.session.keys.length - 1;
        const session = client.session.get(client.session.keys[lastKeyIndex]);
        updateSession(session);
      }
      
      // Add listeners for desired SignClient events
      client.on("session_event", (args) => {
        // Handle session events, such as "chainChanged", "accountsChanged", etc.
      });
      
      client.on("session_update", ({ topic, params }) => {
        const { namespaces } = params;
        const _session = client.session.get(topic);
        // Overwrite the `namespaces` of the existing session with the incoming one.
        const updatedSession = { ..._session, namespaces };
        // Integrate the updated session state into your dapp state.
        // onSessionUpdate(updatedSession);
      });
      
      client.on("session_delete", () => {
        // Session was deleted -> reset the dapp state, clean up from user session, etc.
      });
      
      setClient(client);
      
    })()
  }, [updateSession]);


  const onTransfer = useCallback(async ({address: recipient, amount}) => {
    setLoading(true);
    const { api, chainId } = network;
    const { topic } = session;
    const {account_number: accountNumber, sequence} = await getAccountNumberAndSequence(address, api);
    const signerData = {
      accountNumber,
      sequence,
      chainId,
    }
    // sign params
    // https://cosmos.github.io/cosmjs/latest/stargate/interfaces/AminoMsgSend.html
    const params = { 
      messages: [
        { 
          type: 'cosmos-sdk/MsgSend',
          value: {
            from_address: address,
            to_address: recipient,
            amount: [{
              amount: amount * 10 ** 18,
              denom: DENOM
            }]
          },
        }
      ], 
      fee: {
        amount: [{
          amount: GAS_LIMIT * GAS_PRICE,
          denom: DENOM
        }],
        gas: GAS_LIMIT
      }, 
      memo: "From demo dapp", 
      signerData
    };
    try {
      const aminoResponse = await client.request({
        prompt: true,
        topic,
        chainId: `astra:${NETWORK_PREFIX}${network.key}`,
        request: {
          method: 'sign',
          params,
        },
      });
      console.log({aminoResponse});
      message.success({content: 'Request approved!'})
    } catch(e) {
      message.error({content: e?.message})
    }

    setLoading(false);
  }, [address, client, network, session]);
  
  return (
    <div className="main">
      <div className='logo'>
        <img src="/walletconnect-logo.svg" alt="wallet connect" />
        <span>WalletConnect</span>
        
      </div>
      {
        !connected && <>
          <Card style={{width: 300, margin: 'auto'}}>
            <Form.Item label={"Select network"}>
              <Select 
                placeholder="Select network"
                value={network}
                onChange={onChangeNetwork}
              >
                {
                  NETWORKS.map(n => <Select.Option value={n.key}>{n.name}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <div className='text-center'>
              <Button disabled={!client} onClick={() => connect()} type="primary">{client ? 'Connect to wallet' : 'Initilizing connection'}</Button>
            </div>
          </Card>
        </>
      }
      {
        connected && <>
          <div style={{width: 300, margin: 'auto'}}>
          <Card>
            <Form.Item label="Selected network">
              <Input value={network?.name} readOnly />
            </Form.Item>
            <Form.Item label="Connected address">
              <Input.Group style={{ display: 'flex' }} compact>
                <Input readOnly value={address}/>
                <Button type="primary" onClick={disconnect}>Disconnect</Button>
              </Input.Group>
            </Form.Item>
            
          </Card>

          {connected && <div style={{marginTop: 30  }}>
            <TransferForm loading={loading} onSubmit={onTransfer} />
            </div>
          }
          </div>
        </>
      }


    </div>
  );
}

export default App;

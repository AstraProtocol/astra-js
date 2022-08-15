import './App.css';
import {
  Button, Form, Input, Select
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  RELAY_URL,
  SignClient,
  QRCodeModal
} from '@astra-sdk/wallet-connect/lib/index';
import ValidatorSelect from './components/ValidatorSelect';

const NETWORKS = [
  {
    name: 'Testnet',
    key: 'testnet',
    rpc: 'https://rpc.astranaut.dev',
    api: 'https://api.astranaut.dev'
  },
  {
    name: 'Mainnet',
    key: 'mainnet',
    rpc: 'https://rpc.astranaut.dev',
    api: 'https://api.astranaut.dev'
  }
];
const NETWORK_PREFIX = 'astra-';


const PROTOCOL = 'ws://'; // Swith to wss in production

function App() {
  
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [client, setClient] = useState(null);
  const [pairings, setPairings] = useState([]);
  const [address, setAddress] = useState(null);

  const connected = !!address;

  const onChangeNetwork = useCallback((key) => {
    setNetwork(NETWORKS.find(n => n.key === key));
  }, []);

  const updateSession = useCallback((session) => {
    const allNamespaceAccounts = Object.values(session.namespaces)
      .map(namespace => namespace.accounts)
      .flat();
    const addresses = allNamespaceAccounts.map(str => str.split(':')[2]);
    const networks = allNamespaceAccounts.map(str => str.split(':')[1].substring(NETWORK_PREFIX.length));
    onChangeNetwork(networks[0]);
    setAddress(addresses?.[0]);
  }, [onChangeNetwork]);

  const connect = useCallback(async (topic) => {
    
    const { uri, approval } = await client.connect({
      pairingTopic: topic, // set pairingTopic with topic if you want to connect to a existed pairing
      requiredNamespaces: {
        astra: {
          chains: [`astra:${NETWORK_PREFIX}${network}`],
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

  }, [client, network]);

  const disconnect = useCallback(() => {

  }, []);
  

  useEffect(() => {
    (async () => {
      const client = await SignClient.init({
        relayUrl: PROTOCOL + RELAY_URL,
        metadata: {
          name: 'DEMO DAPP',
          description: 'Demo to connect via Wallet Connect',
          url: window.location.origin,
          icons: [
            `${window.location.origin}/logo192.png`
          ],
        },
      });

      
      // Store existed pairings
      setPairings(client.pairing.values);
      
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
  }, []);
  
  return (
    <div className="main">
      <div className='logo'>
        <img src="/walletconnect-logo.svg" alt="wallet connect" />
        <span>WalletConnect</span>
        
      </div>
      {
        !connected && <>
          <div style={{width: 300, margin: 'auto'}}>
            <Form.Item label="Select network">
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
          </div>
        </>
      }
      {
        connected && <>
          <div style={{width: 300, margin: 'auto'}}>
            <Form.Item label="Selected network">
              <Input value={network?.name} readOnly />
            </Form.Item>
            <Form.Item label="Connected address">
              <Input readOnly value={address} />
            </Form.Item>

            <b>Delegate</b>
            <Form.Item label="Validator">
              <ValidatorSelect api={network?.api} />
            </Form.Item>
          </div>
        </>
      }

    </div>
  );
}

export default App;

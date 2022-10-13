import './App.css';
import {
  Button, Card, Form, Input, message, Select
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { AstraWalletConnector } from '@astra-sdk/connector'
import { useLocalStorage } from './hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const NETWORKS = [
  {
    name: 'Testnet',
    key: 'testnet',
    rpc: 'https://rpc.astranaut.dev',
    api: 'https://api.astranaut.dev',
    chainId: '11115'
  },
  {
    name: 'Mainnet',
    key: 'mainnet',
    rpc: 'https://rpc.astranaut.dev',
    api: 'https://api.astranaut.dev',
    chainId: '11115'
  }
];
function App() {
  const [connected, setConnected] = useLocalStorage('connected', false);
  const [network, setNetwork] = useLocalStorage('network', NETWORKS[0]);
  const [loading, setLoading] = useState(false);
  const [connector, setConnector] = useState(null);
  const [address, setAddress] = useState(null);

  const onChangeNetwork = useCallback((key) => {
    setNetwork(NETWORKS.find(n => n.key === key));
  }, []);

  const connect = useCallback(async (topic) => {
    try {
      const { provider, chainId, account } = await connector.activate();
      console.log({
        provider, chainId, account
      })
      setAddress(account);
      setConnected(true);
    } catch(e) {
      console.log(e);
      // Astra Wallet Provider: Not supported
    }

  }, [connector]);

  const disconnect = useCallback(async (e) => {
    await connector.deactivate();
    setAddress(null);
    setConnected(false);
  }, [connector]);

  useEffect(() => {
    (async () => {
      const connector = await AstraWalletConnector.create({
        url: network.rpc,
        chainId: network.chainId,
      });

      setConnector(connector);
      
      await connector.setup({
        metadata: {
          name: 'Demo App',
          icon: window.location.origin + '/logo192.png',
          location: window.location
        }
      });

      try {
        const { account } = await connector.activate();
        setAddress(account);
        setConnected(true);
      } catch(e) {
        console.log(e);
      }
      
    })()
  }, []);

  const onSendEthPayload = useCallback(async () => {
    setLoading(true);
    const txData = {
      gas: '0x231ab',
      gasPrice: '0x2540be400',
      value: '0xde0b6b3a7640000',
      from: '0x64453f5ebc8a36f0be65e6ec77f3c75182255507',
      to: '0xf6a7620f4fff8197127a1c1c05cb5866bfc5a7ce',
      data: '0x7ff36ab500000000000000000000000000000000000000000000000434bb152206515f55000000000000000000000000000000000000000000000000000000000000008000000000000000000000000064453f5ebc8a36f0be65e6ec77f3c751822555070000000000000000000000000000000000000000000000000000000062c3b20e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000004fdc1fb9c36c855316ba66aaf2dc34aefd68053300000000000000000000000022f1a047857ecbc45e0ca2c554725907af6b204e',
    };
    const provider = await connector.getProvider();
    console.log({provider})
    const result = provider.sendAsync({
      id: uuidv4(),
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [txData]
    }, (error, result) => {
      setLoading(false);
      console.log({error, result});
    });
  }, [connector]);
  
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
              <Button loading={loading} onClick={onSendEthPayload}>Send ETH Payload</Button>
              </div>
            }
          </div>
        </>
      }


    </div>
  );
}

export default App;

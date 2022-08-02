import { EventEmitter } from 'events';
import { safeJsonParse, safeJsonStringify } from 'safe-json-utils';
import {
  formatJsonRpcError,
  isReactNative,
  isWsUrl,
  isLocalhostUrl,
  parseConnectionError,
} from '@walletconnect/jsonrpc-utils';
import WS from './tini-socket';
// const WS = global?.WebSocket;

export class WsConnection {
  constructor(url) {
    this.url = url;
    this.events = new EventEmitter();
    this.registering = false;
    if (!isWsUrl(url)) {
      throw new Error(`Provided URL is not compatible with WebSocket connection: ${url}`);
    }
    this.url = url;
  }
  get connected() {
    return typeof this.socket !== 'undefined';
  }
  get connecting() {
    return this.registering;
  }
  on(event, listener) {
    this.events.on(event, listener);
  }
  once(event, listener) {
    this.events.once(event, listener);
  }
  off(event, listener) {
    this.events.off(event, listener);
  }
  removeListener(event, listener) {
    this.events.removeListener(event, listener);
  }
  async open(url = this.url) {
    await this.register(url);
  }
  async close() {
    if (typeof this.socket === 'undefined') {
      throw new Error('Connection already closed');
    }
    this.socket.close();
    this.onClose();
  }
  async send(payload) {
    if (typeof this.socket === 'undefined') {
      this.socket = await this.register();
    }
    try {
      this.socket.send(safeJsonStringify(payload));
    } catch (e) {
      this.onError(payload.id, e);
    }
  }
  register(url = this.url) {
    if (!isWsUrl(url)) {
      throw new Error(`Provided URL is not compatible with WebSocket connection: ${url}`);
    }
    if (this.registering) {
      return new Promise((resolve, reject) => {
        this.events.once('register_error', (error) => {
          reject(error);
        });
        this.events.once('open', () => {
          if (typeof this.socket === 'undefined') {
            return reject(new Error('WebSocket connection is missing or invalid'));
          }
          resolve(this.socket);
        });
      });
    }
    this.url = url;
    this.registering = true;
    return new Promise((resolve, reject) => {
      const opts = !isReactNative() ? { rejectUnauthorized: !isLocalhostUrl(url) } : undefined;
      const socket = new WS(url, [], opts);
      socket.onopen(() => {
        this.onOpen(socket);
        resolve(socket);
      });
      socket.onerror((event) => {
        const error = this.parseError(event.error);
        this.events.emit('register_error', error);
        this.onClose();
        reject(error);
      });
      // only use when swith ws to tini-socket
      socket.open();
    });
  }
  onOpen(socket) {
    socket.onmessage((event) => this.onPayload(event));
    socket.onclose(() => this.onClose());
    socket.onerror((event) => {
      const error = this.parseError(event.error);
      this.events.emit('error', error);
    });
    this.socket = socket;
    this.registering = false;
    this.events.emit('open');
  }
  onClose() {
    this.socket = undefined;
    this.registering = false;
    this.events.emit('close');
  }
  onPayload(e) {
    if (typeof e.data === 'undefined') return;
    const payload = typeof e.data === 'string' ? safeJsonParse(e.data) : e.data;
    this.events.emit('payload', payload);
  }
  onError(id, e) {
    const error = this.parseError(e);
    const message = error.message || error.toString();
    const payload = formatJsonRpcError(id, message);
    this.events.emit('payload', payload);
  }
  parseError(e, url = this.url) {
    try {
      return parseConnectionError(e, url, 'WS');
    } catch {
      return e;
    }
  }
}
export default WsConnection;

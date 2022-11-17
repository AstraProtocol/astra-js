// To avoid duplicate message listener
// TODO: Use socket task id

const createMySocketInstance = () => {
  let self = {};
  self.onSocketOpen = () => {};
  self.onSocketMessage = () => {};
  self.onSocketClose = () => {};
  self.onSocketError = () => {};

  self.eventsSetup = false;
  
  function onSocketOpen(callback) {
    console.log('set onSocketOpen', callback)
    self.onSocketOpen = callback;
  };

  function onSocketClose(callback) {
    console.log('set onSocketClose', callback)
    self.onSocketClose = callback;
  };
  
  function onSocketError(callback) {
    console.log('set onSocketError', callback)
    self.onSocketError = callback;
  };

  function onSocketMessage(callback) {
    console.log('set onSocketMessage', callback)
    self.onSocketMessage = callback;
  };

  function connectSocket(params) {
    console.log('CONNECT', params);
    if(!self.eventsSetup) {
      my.onSocketOpen((e) => {
        console.log('WC:OPEN', params);
        self.onSocketOpen(e);
      });
      my.onSocketMessage((e) => {
        console.log('WC:MESSAGE', params);
        self.onSocketMessage(e);
      });
      my.onSocketClose((e) => {
        console.log('WC:CLOSE', params);
        self.onSocketClose(e);
      });
      my.onSocketError((e) => {
        console.log('WC:ERROR', params);
        self.onSocketError(e);
      });
      self.eventsSetup = true;
    }

    my.connectSocket(params);
  };

  return {
    onSocketOpen,
    onSocketMessage,
    connectSocket,
    onSocketClose,
    onSocketError
  }
};

const sc = createMySocketInstance();

export default class WS {
  constructor(url) {
    this.closed = false;
    this.url = url;
  }
  open() {
    sc.connectSocket({
      url: this.url,
      data: {},
    });
  }
  close() {
    // Vì lib chưa handle tốt callback socketClose
    // Tạm thời không đóng socket
    // sẽ tự đóng khi open socket mới

    my.closeSocket({
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  }
  onopen(callback) {
    sc.onSocketOpen(callback)
  }
  onmessage(callback) {
    sc.onSocketMessage(callback)
  }
  onclose(callback) {
    sc.onSocketClose(callback)
  }
  onerror(callback) {
    sc.onSocketError(callback)
  }
  send(data) {
    my.sendSocketMessage({
      data,
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  }
}

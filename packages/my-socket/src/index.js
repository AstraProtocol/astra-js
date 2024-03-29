export default class WS {
  constructor(url) {
    this.url = url;
  }
  open() {
    my.connectSocket({
      url: this.url,
      data: {},
    });
  }
  close() {
    my.closeSocket({
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  }
  send(data) {
    my.sendSocketMessage({
      data,
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  }
  onopen(callback) {
    my.onSocketOpen(callback);
  }
  onerror(callback) {
    my.onSocketError(callback);
  }
  onmessage(callback) {
    my.onSocketMessage((res) => {
      callback(res);
    });
  }
  onclose(callback) {
    my.onSocketClose(callback);
  }
}

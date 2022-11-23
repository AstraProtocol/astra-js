class WS {
  
  constructor(url, params, opts) {
    this.url = url;
    this.params = params;
    this.opts = opts;
    this.socketTaskId = new Date().getTime();

    this.onopen = () => {};
    this.onclose = () => {};
    this.onmessage = () => {};
    this.onerror = () => {};

    this.subscribe();

  }
  
  open() {
    my.connectSocket({
      socketTaskId: this.socketTaskId,
      url: this.url
    });
  }

  isValidEvent(event, name) {
    return event.socketTaskId === this.socketTaskId;
  }

  onSocketOpen = (event) => {
    if(this.isValidEvent(event, 'onSocketOpen')) {
      this.onopen(event)
    }
  }
  onSocketMessage = (event) => {
    if(this.isValidEvent(event, 'onSocketMessage')) {
      this.onmessage(event)
    }
  }
  onSocketError = (event) => {
    if(this.isValidEvent(event, 'onSocketError')) {
      this.onerror(event)
    }
  }
  onSocketClose = (event) => {
    if(this.isValidEvent(event, 'onSocketClose')) {
      this.onclose(event)
    }
  }

  subscribe() {
    my.onSocketTaskOpen(this.onSocketOpen);
    my.onSocketTaskMessage(this.onSocketMessage);
    my.onSocketTaskError(this.onSocketError);
    my.onSocketTaskClose(this.onSocketClose);
  }

  unsubscribe() {
    my.offSocketTaskOpen(this.onSocketOpen);
    my.offSocketTaskMessage(this.onSocketMessage);
    my.offSocketTaskError(this.onSocketError);
    my.offSocketTaskClose(this.onSocketClose);
  }

  close() {
    my.closeSocket({
      socketTaskId: this.socketTaskId,
    });
    this.unsubscribe();
  }

  send(data) {
    my.sendSocketMessage({
      socketTaskId: this.socketTaskId,
      data,
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  }

}
export default WS;
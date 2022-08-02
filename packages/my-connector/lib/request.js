"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequest = void 0;

var _utils = require("./utils");

class RequestError extends Error {
  constructor(message, code, data) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    this.code = code;
    this.data = data;
  }

}

const createRequest = url => {
  return async (method, params) => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: (0, _utils.generateUUID)(),
        method,
        params
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new RequestError(`${response.status}: ${response.statusText}`, -32000);
    const body = await response.json();

    if ('error' in body) {
      var _body$error, _body$error2, _body$error3;

      throw new RequestError(body === null || body === void 0 ? void 0 : (_body$error = body.error) === null || _body$error === void 0 ? void 0 : _body$error.message, body === null || body === void 0 ? void 0 : (_body$error2 = body.error) === null || _body$error2 === void 0 ? void 0 : _body$error2.code, body === null || body === void 0 ? void 0 : (_body$error3 = body.error) === null || _body$error3 === void 0 ? void 0 : _body$error3.data);
    } else if ('result' in body) {
      return body.result;
    } else {
      throw new RequestError(`Received unexpected JSON-RPC response to ${method} request.`, -32000, body);
    }
  };
};

exports.createRequest = createRequest;
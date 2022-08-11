"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "LegacyModal", {
  enumerable: true,
  get: function () {
    return _legacyModal.default;
  }
});
exports.RELAY_URL = void 0;
Object.defineProperty(exports, "SignClient", {
  enumerable: true,
  get: function () {
    return _signClient.default;
  }
});

var _legacyModal = _interopRequireDefault(require("@walletconnect/legacy-modal"));

var _signClient = _interopRequireDefault(require("@walletconnect/sign-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RELAY_URL = 'wc-relay.astranaut.dev';
exports.RELAY_URL = RELAY_URL;
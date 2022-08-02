"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.KeyValueStorage = exports.KEY = void 0;

var _safeJsonUtils = require("safe-json-utils");

function parseEntry(entry) {
  var _a;

  return [entry[0], (0, _safeJsonUtils.safeJsonParse)((_a = entry[1]) !== null && _a !== void 0 ? _a : '')];
}

const KEY = 'wc';
exports.KEY = KEY;
const AsyncStorage = {
  getData() {
    return new Promise((resolve, reject) => {
      my.getStorage({
        key: KEY,
        success: function (res) {
          try {
            resolve((0, _safeJsonUtils.safeJsonParse)(res.data));
          } catch {
            resolve({});
          }
        },
        fail: function (res) {
          reject(res.errorMessage);
        }
      });
    });
  },

  getItem(key) {
    return new Promise((resolve, reject) => {
      my.getStorage({
        key: KEY,
        success: function (res) {
          var _data;

          let data = {};

          try {
            data = (0, _safeJsonUtils.safeJsonParse)(res.data); // eslint-disable-next-line no-empty
          } catch {}

          resolve(((_data = data) === null || _data === void 0 ? void 0 : _data[key]) || null);
        },
        fail: function (res) {
          reject(res.errorMessage);
        }
      });
    });
  },

  setItem(key, value) {
    return new Promise(async (resolve, reject) => {
      const data = (await this.getData()) || {};
      data[key] = value;
      my.setStorage({
        key: KEY,
        data: (0, _safeJsonUtils.safeJsonStringify)(data),
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        }
      });
    });
  },

  removeItem(key) {
    return new Promise(async (resolve, reject) => {
      const data = (await this.getData()) || {};
      delete data[key];
      my.setStorage({
        key: KEY,
        data: (0, _safeJsonUtils.safeJsonStringify)(data),
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        }
      });
    });
  },

  clear() {
    return new Promise((resolve, reject) => {
      my.removeStorage({
        key: KEY,
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        }
      });
    });
  },

  key(n) {
    // not done yet
    return n;
  },

  getAllKeys() {
    return new Promise(async resolve => {
      const data = (await this.getData()) || {};
      resolve(Object.keys(data));
    });
  },

  async multiGet(keys = []) {
    return new Promise(async resolve => {
      const data = (await this.getData()) || {};
      resolve(Object.keys(data));
      const results = keys.map(key => data[key]);
      resolve(results);
    });
  },

  length: 0
};
const BrowserStorage = {
  async getItem(key) {
    return localStorage.getItem(key);
  },

  async setItem(key, value) {
    return localStorage.setItem(key, value);
  },

  async removeItem(key) {
    return localStorage.removeItem(key);
  },

  clear() {},

  key(n) {
    return n;
  },

  async getAllKeys() {
    return [];
  },

  async multiGet(keys = []) {
    return keys.map(key => localStorage.getItem(key));
  },

  length: 0
};

const getStorage = () => {
  if (typeof localStorage !== 'undefined') {
    return BrowserStorage;
  }

  return AsyncStorage;
};

class KeyValueStorage {
  constructor() {
    this.storage = getStorage();
  }

  async getKeys() {
    return this.storage.getAllKeys();
  }

  async getEntries() {
    const keys = await this.getKeys();
    const entries = await this.storage.multiGet(keys);
    return entries.map(parseEntry);
  }

  async getItem(key) {
    const item = await this.storage.getItem(key);

    if (typeof item == 'undefined' || item === null) {
      return undefined;
    }

    return (0, _safeJsonUtils.safeJsonParse)(item);
  }

  async setItem(key, value) {
    await this.storage.setItem(key, (0, _safeJsonUtils.safeJsonStringify)(value));
  }

  async removeItem(key) {
    await this.storage.removeItem(key);
  }

}

exports.KeyValueStorage = KeyValueStorage;
var _default = KeyValueStorage;
exports.default = _default;
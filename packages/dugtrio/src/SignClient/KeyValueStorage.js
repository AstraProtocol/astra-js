/* eslint-disable no-async-promise-executor */
import { safeJsonParse, safeJsonStringify } from 'safe-json-utils';

function parseEntry(entry) {
  var _a;
  return [entry[0], safeJsonParse((_a = entry[1]) !== null && _a !== void 0 ? _a : '')];
}

export const KEY = 'wc';

export const AsyncStorage = {
  getItem(key) {
    return new Promise((resolve, reject) => {
      my.getStorage({
        key: key,
        success: function (res) {
          try {
            resolve(res.data);
            // eslint-disable-next-line no-empty
          } catch {
            reject(null)
          }
        },
        fail: function (res) {
          reject(res.errorMessage);
        },
      });
    });
  },
  setItem(key, value) {
    console.log('setItem', value, safeJsonStringify(value))
    return new Promise(async (resolve, reject) => {
      my.setStorage({
        key,
        data: safeJsonStringify(value),
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        },
      });
    });
  },
  removeItem(key) {
    return new Promise(async (resolve, reject) => {
      my.removeStorage({
        key,
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        },
      });
    });
  },
  clear() {
    return new Promise((resolve, reject) => {
      // not done yet
      resolve()
    });
  },
  key(n) {
    // not done yet
    return n;
  },
  getAllKeys() {
    // not done yet
    return new Promise(async (resolve) => {
      resolve([]);
    });
  },
  multiGet(keys = []) {
    const prs = keys.map(key => this.getItem(key))
    return Promise.all(prs);
  },
  length: 0,
};

const BrowserStorage = {
  async getItem(key) {
    console.log('@@browser@@getItem');
    return localStorage.getItem(key);
  },
  async setItem(key, value) {
    console.log('@@browser@@setItem');
    return localStorage.setItem(key, value);
  },
  async removeItem(key) {
    return localStorage.removeItem(key);
  },
  clear() {
    console.log('@@clear');
  },
  key(n) {
    console.log('@@nnn');
    return n;
  },
  async getAllKeys() {
    return [];
  },
  async multiGet(keys = []) {
    return keys.map((key) => localStorage.getItem(key));
  },
  length: 0,
};

const getStorage = () => {
  if (typeof localStorage !== 'undefined') {
    return BrowserStorage;
  }

  return AsyncStorage;
};

export class KeyValueStorage {
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
    return safeJsonParse(item);
  }
  async setItem(key, value) {
    await this.storage.setItem(key, safeJsonStringify(value));
  }
  async removeItem(key) {
    await this.storage.removeItem(key);
  }
}
export default KeyValueStorage;
//# sourceMappingURL=index.js.map

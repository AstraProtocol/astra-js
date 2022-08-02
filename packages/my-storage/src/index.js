import { safeJsonParse, safeJsonStringify } from 'safe-json-utils';

function parseEntry(entry) {
  var _a;
  return [entry[0], safeJsonParse((_a = entry[1]) !== null && _a !== void 0 ? _a : '')];
}

export const KEY = 'wc';

const AsyncStorage = {
  getData() {
    return new Promise((resolve, reject) => {
      my.getStorage({
        key: KEY,
        success: function (res) {
          try {
            resolve(safeJsonParse(res.data));
          } catch {
            resolve({});
          }
        },
        fail: function (res) {
          reject(res.errorMessage);
        },
      });
    });
  },
  getItem(key) {
    return new Promise((resolve, reject) => {
      my.getStorage({
        key: KEY,
        success: function (res) {
          let data = {};
          try {
            data = safeJsonParse(res.data);
            // eslint-disable-next-line no-empty
          } catch {}
          resolve(data?.[key] || null);
        },
        fail: function (res) {
          reject(res.errorMessage);
        },
      });
    });
  },
  setItem(key, value) {
    return new Promise(async (resolve, reject) => {
      const data = (await this.getData()) || {};
      data[key] = value;
      my.setStorage({
        key: KEY,
        data: safeJsonStringify(data),
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
      const data = (await this.getData()) || {};
      delete data[key];
      my.setStorage({
        key: KEY,
        data: safeJsonStringify(data),
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
      my.removeStorage({
        key: KEY,
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        },
      });
    });
  },
  key(n) {
    // not done yet
    return n;
  },
  getAllKeys() {
    return new Promise(async (resolve) => {
      const data = (await this.getData()) || {};
      resolve(Object.keys(data));
    });
  },
  async multiGet(keys = []) {
    return new Promise(async (resolve) => {
      const data = (await this.getData()) || {};
      resolve(Object.keys(data));
      const results = keys.map((key) => data[key]);
      resolve(results);
    });
  },
  length: 0,
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

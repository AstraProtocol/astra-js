import * as R from 'ramda';
export const storageGenerator = (key) => {
  let store = {};
  return {
    getItem: () => Promise.resolve(R.propOr(undefined, key, store)),
    setItem: (value) => {
      store[key] = value;
      return Promise.resolve(null);
    },
    removeItem: () => {
      store[key] = null;
      return Promise.resolve(null);
    },
  };
};

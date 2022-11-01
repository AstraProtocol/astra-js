import { map, reject, compose, apply, applyTo, uniq, equals } from 'ramda';
import {BigNumber} from '@ethersproject/bignumber';
import {Dec, Int} from '@keplr-wallet/unit';

const R = { compose, map, reject, apply, applyTo, uniq, equals };

export const numberToHex = (value, decimals = 0) => {
  const dValue = new Dec(String(value)).mul((new Dec('10')).pow(new Int(decimals)));
  return BigNumber.from(dValue.toString(0)).toHexString();
};

export const miniStream = () => {
  const self = {
    listeners: {},
  };
  const register = (name, cb) => {
    const listeners = self.listeners[name] || [];
    listeners.push(cb);
    self.listeners[name] = listeners;
    return () => removeListener(name, cb);
  };

  const removeListener = (name, cb) => {
    const listeners = self.listeners[name] || [];
    self.listeners[name] = R.reject(R.equals(cb), listeners);
  };

  const _invoke = (name, ...data) => {
    const listeners = self.listeners[name] || [];
    R.map(R.compose(R.applyTo(data), R.apply), listeners);
  };

  const invoke = (name, ...data) => {
    setTimeout(() => _invoke(name, ...data), 0);
  };

  const invokeDelay = (name, time, ...data) => {
    const timeout = setTimeout(() => _invoke(name, ...data), time);
    return () => clearTimeout(timeout);
  };

  return {
    register,
    invokeDelay,
    invoke,
  };
};

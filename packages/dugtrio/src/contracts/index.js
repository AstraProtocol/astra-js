import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers"

export { default as createHttpProvider } from './http-provider';
export { default as abis } from './abis';

export const createContract = (address, _interface, httpProvider) => new Contract(address, _interface, new Web3Provider(httpProvider));
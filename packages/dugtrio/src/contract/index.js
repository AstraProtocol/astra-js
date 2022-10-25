import {Contract} from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers"
import createProvider from './http-provider';
import contractInterface from './interface';
const createContract = (rpc, contractAddress, axiosInstance) => {
  const httpProvider = createProvider(rpc, axiosInstance);
  const provider = new Web3Provider(httpProvider);
  const contract = new Contract(contractAddress, contractInterface, provider);
  return contract;
};
export default createContract
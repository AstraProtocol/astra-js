import { Interface } from "@ethersproject/abi"
const contractInterface = new Interface([
  "function balanceOf(address) view returns (uint)"
]);
export default contractInterface;
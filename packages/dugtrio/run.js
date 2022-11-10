const abiDecoder = require('abi-decoder');
const axios = require('axios');
const { Web3Provider } = require("@ethersproject/providers")
const createHttpProvider = require('./src/contract/http-provider');

const run = async () => {
  
  const provider = new Web3Provider(createHttpProvider('https://rpc.astranaut.dev', axios))
  
  const ticketboxABI = [
    {
      inputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "symbol",
          type: "string",
        },
        {
          internalType: "string",
          name: "baseURI_",
          type: "string",
        },
        {
          internalType: "address",
          name: "admin",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "ApprovalForAll",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32",
        },
      ],
      name: "RoleAdminChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "RoleGranted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "RoleRevoked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MINTER_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "PAUSER_ROLE",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "baseURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
      ],
      name: "getRoleAdmin",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "getTokenIdsOfOwner",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "hasRole",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "safeMint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenOfOwnerByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  // swap abi
  const swapABI = [
    {
      "inputs": [],
      "name": "WETH",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountADesired",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountBDesired",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountAMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountBMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountTokenDesired",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountTokenMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETHMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "addLiquidityETH",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETH",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "factory",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveOut",
          "type": "uint256"
        }
      ],
      "name": "getAmountIn",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveOut",
          "type": "uint256"
        }
      ],
      "name": "getAmountOut",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        }
      ],
      "name": "getAmountsIn",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        }
      ],
      "name": "getAmountsOut",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveB",
          "type": "uint256"
        }
      ],
      "name": "quote",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountAMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountBMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountTokenMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETHMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidityETH",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETH",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountTokenMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETHMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidityETHSupportingFeeOnTransferTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountETH",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountTokenMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETHMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "approveMax",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "removeLiquidityETHWithPermit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETH",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountTokenMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountETHMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "approveMax",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountETH",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountAMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountBMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "approveMax",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "removeLiquidityWithPermit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountA",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountB",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapETHForExactTokens",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOutMin",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapExactETHForTokens",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOutMin",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountOutMin",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapExactTokensForETH",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountOutMin",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountOutMin",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapExactTokensForTokens",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountOutMin",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountInMax",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapTokensForExactETH",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountInMax",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "path",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "swapTokensForExactTokens",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  
  
  abiDecoder.addABI(ticketboxABI);
  abiDecoder.addABI(swapABI);
  // abiDecoder.addABI([
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_bridge",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "removeBridge",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "name",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "string"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_spender",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "approve",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "totalSupply",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "PERMIT_TYPEHASH",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bytes32"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "decimals",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint8"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "DOMAIN_SEPARATOR",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bytes32"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "spender",
  //         "type": "address"
  //       },
  //       {
  //         "name": "addedValue",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "increaseAllowance",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_value",
  //         "type": "uint256"
  //       },
  //       {
  //         "name": "_data",
  //         "type": "bytes"
  //       }
  //     ],
  //     "name": "transferAndCall",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "mint",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "burn",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "bridgePointers",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "version",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "string"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "blockRewardContract",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_spender",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_subtractedValue",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "decreaseApproval",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_token",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "claimTokens",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [
  //       {
  //         "name": "_owner",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "balanceOf",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [
  //       {
  //         "name": "_address",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "isBridge",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "nonces",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "getTokenInterfacesVersion",
  //     "outputs": [
  //       {
  //         "name": "major",
  //         "type": "uint64"
  //       },
  //       {
  //         "name": "minor",
  //         "type": "uint64"
  //       },
  //       {
  //         "name": "patch",
  //         "type": "uint64"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "pure",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "owner",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_holder",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_spender",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_nonce",
  //         "type": "uint256"
  //       },
  //       {
  //         "name": "_expiry",
  //         "type": "uint256"
  //       },
  //       {
  //         "name": "_allowed",
  //         "type": "bool"
  //       },
  //       {
  //         "name": "_v",
  //         "type": "uint8"
  //       },
  //       {
  //         "name": "_r",
  //         "type": "bytes32"
  //       },
  //       {
  //         "name": "_s",
  //         "type": "bytes32"
  //       }
  //     ],
  //     "name": "permit",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "symbol",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "string"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_bridge",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "addBridge",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "bridgeList",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "address[]"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "spender",
  //         "type": "address"
  //       },
  //       {
  //         "name": "subtractedValue",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "decreaseAllowance",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "push",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_from",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "move",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "F_ADDR",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_spender",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_addedValue",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "increaseApproval",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [
  //       {
  //         "name": "_owner",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_spender",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "allowance",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "stakingContract",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_from",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "pull",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_newOwner",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "transferOwnership",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [],
  //     "name": "bridgeCount",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "constant": true,
  //     "inputs": [
  //       {
  //         "name": "",
  //         "type": "address"
  //       },
  //       {
  //         "name": "",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "expirations",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "view",
  //     "type": "function"
  //   },
  //   {
  //     "inputs": [
  //       {
  //         "name": "_name",
  //         "type": "string"
  //       },
  //       {
  //         "name": "_symbol",
  //         "type": "string"
  //       },
  //       {
  //         "name": "_decimals",
  //         "type": "uint8"
  //       },
  //       {
  //         "name": "_chainId",
  //         "type": "uint256"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "constructor"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "bridge",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "BridgeAdded",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "bridge",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "BridgeRemoved",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": false,
  //         "name": "from",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "to",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "ContractFallbackCallFailed",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "to",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "Mint",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "previousOwner",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": true,
  //         "name": "newOwner",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "OwnershipTransferred",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "burner",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "Burn",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "from",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": true,
  //         "name": "to",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "value",
  //         "type": "uint256"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "data",
  //         "type": "bytes"
  //       }
  //     ],
  //     "name": "Transfer",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "owner",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": true,
  //         "name": "spender",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "Approval",
  //     "type": "event"
  //   },
  //   {
  //     "anonymous": false,
  //     "inputs": [
  //       {
  //         "indexed": true,
  //         "name": "from",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": true,
  //         "name": "to",
  //         "type": "address"
  //       },
  //       {
  //         "indexed": false,
  //         "name": "value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "Transfer",
  //     "type": "event"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_blockRewardContract",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "setBlockRewardContract",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_stakingContract",
  //         "type": "address"
  //       }
  //     ],
  //     "name": "setStakingContract",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "mintReward",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_staker",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_amount",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "stake",
  //     "outputs": [],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "transfer",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   },
  //   {
  //     "constant": false,
  //     "inputs": [
  //       {
  //         "name": "_from",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_to",
  //         "type": "address"
  //       },
  //       {
  //         "name": "_value",
  //         "type": "uint256"
  //       }
  //     ],
  //     "name": "transferFrom",
  //     "outputs": [
  //       {
  //         "name": "",
  //         "type": "bool"
  //       }
  //     ],
  //     "payable": false,
  //     "stateMutability": "nonpayable",
  //     "type": "function"
  //   }
  // ]
  // );
  
  const transferNFTHash = '0x44768db48b4d04052425572a15ca3c144627c18a3948a111a19e2708da7089b4';
  // const swapHash = '0x32b4d8c3df2aaf22598699e2016459cc7671884f58b8c5c5304cac7c5aea6bc3';
  const swapHash = '0x13d70cfcc6fd261bd4715aedc5d646ba132b3923579fa07673404981f5449821';
  const sendHash = '0x9492cd018525fa1d0a924bcf6276c92428dd51dc3f720cf3a377a78641c38d8c';
  
  // const tx = await provider.getTransaction(transferNFTHash);
  // console.log({tx})
  // console.log('decoded', abiDecoder.decodeMethod(tx.data))



  const tx2 = await provider.getTransaction(sendHash);
  console.log({tx2})
  console.log('decoded', abiDecoder.decodeMethod(tx2.data))
  
  

}

run()
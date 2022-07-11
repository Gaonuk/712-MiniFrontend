export const depositABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenContract",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokenDeposit",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_tokenContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "contract IERC20",
            "name": "sellToken",
            "type": "address"
          },
          {
            "internalType": "contract IERC20",
            "name": "buyToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "address payable",
            "name": "swapTarget",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "swapCallData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PermitSwap.SwapData",
        "name": "data",
        "type": "tuple"
      }
    ],
    "name": "swapNormal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "_tokenContract",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "_v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "_r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "_s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct PermitSwap.PermitData",
        "name": "permit",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "contract IERC20",
            "name": "sellToken",
            "type": "address"
          },
          {
            "internalType": "contract IERC20",
            "name": "buyToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "address payable",
            "name": "swapTarget",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "swapCallData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PermitSwap.SwapData",
        "name": "swapData",
        "type": "tuple"
      }
    ],
    "name": "swapWithPermit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
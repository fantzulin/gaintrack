export const DOLOMITE_MARGIN_ABI = [
  {
    "name": "getAccountBalances",
    "type": "function",
    "inputs":[
      {
        "components":[
            {
              "internalType":"address",
              "name":"owner",
              "type":"address"
            },
            {
              "internalType":"uint256",
              "name":"number",
              "type":"uint256"
            }
        ],
        "internalType":"struct Account.Info",
        "name":"account",
        "type":"tuple"
      }
    ],
    "outputs":[
         {
            "internalType":"uint256[]",
            "name":"marketIds",
            "type":"uint256[]"
         },
         {
            "internalType":"address[]",
            "name":"tokenAddresses",
            "type":"address[]"
         },
         {
            "components":[
               {
                  "internalType":"bool",
                  "name":"sign",
                  "type":"bool"
               },
               {
                  "internalType":"uint128",
                  "name":"value",
                  "type":"uint128"
               }
            ],
            "internalType":"struct Types.Par[]",
            "name":"parBalances",
            "type":"tuple[]"
         },
         {
            "components":[
               {
                  "internalType":"bool",
                  "name":"sign",
                  "type":"bool"
               },
               {
                  "internalType":"uint256",
                  "name":"value",
                  "type":"uint256"
               }
            ],
            "internalType":"struct Types.Wei[]",
            "name":"weiBalances",
            "type":"tuple[]"
         }
      ],
    "stateMutability": "view"
  },
  {
    "name": "getMarketInterestRate",
    "type": "function",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getMarketTotalPar",
    "type": "function",
    "inputs":[
         {
            "internalType":"uint256",
            "name":"marketId",
            "type":"uint256"
         }
      ],
    "outputs":[
         {
            "components":[
               {
                  "internalType":"uint128",
                  "name":"borrow",
                  "type":"uint128"
               },
               {
                  "internalType":"uint128",
                  "name":"supply",
                  "type":"uint128"
               }
            ],
            "internalType":"struct Types.TotalPar",
            "name":"",
            "type":"tuple"
         }
      ],
    "stateMutability": "view"
  },
  {
    "name": "getMarketTotalWei",
    "type": "function",
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "sign",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "internalType": "struct Types.Wei",
        "name": "totalWei",
        "type": "tuple"
      }
    ],
    "stateMutability": "view"
  }
] as const;

export const DOLOMITE_ADDRESS = '0x6Bd780E7fDf01D77e4d475c821f1e7AE05409072';

export const DOLOMITE_TOKENS = [
  {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", //USDC
    symbol: "USDC",
    decimals: 6,
    logo: 'https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png',
    marketId: 17
  },
  {
    address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", //USDC.e
    symbol: "USDCe",
    decimals: 6,
    logo: 'https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png',
    marketId: 2
  }
];

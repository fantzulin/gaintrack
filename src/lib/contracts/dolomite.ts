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
            "name":"",
            "type":"uint256[]"
         },
         {
            "internalType":"address[]",
            "name":"",
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
            "name":"",
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
            "name":"",
            "type":"tuple[]"
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
    logo: 'https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png'
  }
];

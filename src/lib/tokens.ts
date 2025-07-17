export interface Token {
  name: string;
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  logoURI: string;
  minAmount?: string; // 最小交易金額（以 token 為單位）
}

export const ARBITRUM_TOKENS: Token[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    logoURI: "https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png",
    minAmount: "1", // 1 USDC
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    decimals: 6,
    logoURI: "https://logo.moralis.io/0xa4b1_0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9_00fd48dbec30ef6e8fb563f2b0b82b6a.png",
    minAmount: "1", // 1 USDT
  },
  {
    name: "Dai Stablecoin",
    symbol: "DAI",
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    logoURI: "https://logo.moralis.io/0xa4b1_0xda10009cbd5d07dd0cecc66161fc93d7c9000da1_247e8cebb18c62db70489edbff8cc6d8.png",
    minAmount: "1", // 1 DAI
  },
  {
    name: "Bridged USDC",
    symbol: "USDC.e",
    address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    decimals: 6,
    logoURI: "https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png",
    minAmount: "1", // 1 USDC.e
  },
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    decimals: 18,
    logoURI: "https://logo.moralis.io/0xa4b1_0x82af49447d8a07e3bd95bd0d56f35241523fbab1_03f6d08a9f4a4aad3a5b129ad0900dd3.png",
    minAmount: "0.001", // 0.001 WETH
  },
];

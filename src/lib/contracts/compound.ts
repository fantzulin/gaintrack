export const COMPOUND_CONTRACTS = {
  arbitrum: {
    cUSDCEv3: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // USDC.e
    cUSDTv3: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07', // USDT
    cUSDCv3: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // USDC
  },
};

export const COMPOUND_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
];

// Token 信息配置
export const COMPOUND_TOKENS = {
  '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA': {
    symbol: 'USDC.e',
    name: 'Compound USDC.e',
    decimals: 6,
    logo: 'https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png'
  },
  '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07': {
    symbol: 'USDT',
    name: 'Compound USDT',
    decimals: 6,
    logo: 'https://logo.moralis.io/0xa4b1_0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9_00fd48dbec30ef6e8fb563f2b0b82b6a.png'
  },
  '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf': {
    symbol: 'USDC',
    name: 'Compound USDC',
    decimals: 6,
    logo: 'https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png'
  },
}; 
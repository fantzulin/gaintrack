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
    symbol: 'cUSDCEv3',
    name: 'Compound USDC.e',
    decimals: 6,
    logo: 'https://cdn.moralis.io/defi/usdc.png'
  },
  '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07': {
    symbol: 'cUSDTv3',
    name: 'Compound USDT',
    decimals: 6,
    logo: 'https://cdn.moralis.io/defi/usdt.png'
  },
  '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf': {
    symbol: 'cUSDCv3',
    name: 'Compound USDC',
    decimals: 6,
    logo: 'https://cdn.moralis.io/defi/usdc.png'
  },
}; 
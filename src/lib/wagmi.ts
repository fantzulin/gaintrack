import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import {
  mainnet,
  arbitrum,
  arbitrumSepolia,
} from 'viem/chains';

const chains = [
  mainnet,
  arbitrum,
  arbitrumSepolia,
] as const;

// 手動配置錢包，排除 Coinbase Wallet
const { connectors } = getDefaultWallets({
  appName: 'GainTrack',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
});

// 過濾掉 Coinbase Wallet 連接器
const filteredConnectors = connectors.filter(
  connector => !connector.name.toLowerCase().includes('coinbase')
);

export const config = createConfig({
  connectors: filteredConnectors,
  chains,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
}); 
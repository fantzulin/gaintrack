import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  mainnet,
  arbitrum,
  arbitrumSepolia,
} from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'GainTrack',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: [
    mainnet,
    arbitrum,
    arbitrumSepolia,
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
}); 
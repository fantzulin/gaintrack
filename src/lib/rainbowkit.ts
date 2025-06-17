import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
} from 'viem/chains';

const projectId = '6422b67d6b2711911d715cd735a4f251';

export const config = getDefaultConfig({
  appName: 'GainTrack',
  projectId,
  chains: [
    mainnet,
    sepolia,
    arbitrum,
    arbitrumSepolia,
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
}); 
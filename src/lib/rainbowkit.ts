import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import {
  mainnet,
  arbitrum,
  arbitrumSepolia,
} from 'viem/chains';
import {
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
  safeWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';

const chains = [
  mainnet,
  arbitrum,
  arbitrumSepolia,
] as const;

// 手動指定連接器，排除 Coinbase Wallet
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        injectedWallet,
        safeWallet,
        trustWallet,
        ledgerWallet,
      ],
    },
  ],
  {
    appName: 'GainTrack',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  }
);

export const config = createConfig({
  connectors,
  chains,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
}); 
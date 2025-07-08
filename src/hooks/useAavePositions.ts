import { useAccount, useChainId, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';

interface AavePositionToken {
  symbol: string;
  supplyBalance: number;
}

interface AavePosition {
  protocolName: string;
  protocolId: string;
  protocolUrl: string;
  protocolLogo: string;
  position: {
    balanceUsd: number;
    tokens: AavePositionToken[];
  };
}

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Aave V3 aToken addresses
const AAVE_V3_ATOKEN_ADDRESSES: Record<number, {
  aUSDC: `0x${string}`;
  aUSDT: `0x${string}`;
  aDAI: `0x${string}`;
}> = {
  42161: { // Arbitrum One
    aUSDC: "0x724dc807b04555b71ed48a6896b6F41593b8C637", // aUSDC v3
    aUSDT: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620", // aUSDT v3 (Note: aUSDT on Arbitrum is often the same as aUSDC due to bridging)
    aDAI: "0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee", // aDAI v3
  },
};

export function useAavePositions() {
  const { address, isConnected, chainId } = useAccount();
  const [aavePositions, setAavePositions] = useState<AavePosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAaveAddresses = chainId ? AAVE_V3_ATOKEN_ADDRESSES[chainId] : undefined;

  const { data: usdcBalance } = useReadContract({
    address: currentAaveAddresses?.aUSDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!currentAaveAddresses?.aUSDC && !!address,
    },
  });

  const { data: usdtBalance } = useReadContract({
    address: currentAaveAddresses?.aUSDT as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!currentAaveAddresses?.aUSDT && !!address,
    },
  });

  const { data: daiBalance } = useReadContract({
    address: currentAaveAddresses?.aDAI as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!currentAaveAddresses?.aDAI && !!address,
    },
  });

  useEffect(() => {
    if (!isConnected || !address || !chainId) {
      setAavePositions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokens: AavePositionToken[] = [];
      let totalBalanceUsd = 0;

      if (usdcBalance !== undefined) {
        const balance = parseFloat(formatUnits(usdcBalance, 6)); // USDC has 6 decimals
        if (balance > 0) {
          tokens.push({ symbol: "USDC", supplyBalance: balance });
          totalBalanceUsd += balance; // Assuming 1 USDC = 1 USD
        }
      }
      if (usdtBalance !== undefined) {
        const balance = parseFloat(formatUnits(usdtBalance, 6)); // USDT has 6 decimals
        if (balance > 0) {
          tokens.push({ symbol: "USDT", supplyBalance: balance });
          totalBalanceUsd += balance; // Assuming 1 USDT = 1 USD
        }
      }
      if (daiBalance !== undefined) {
        const balance = parseFloat(formatUnits(daiBalance, 18)); // DAI has 18 decimals
        if (balance > 0) {
          tokens.push({ symbol: "DAI", supplyBalance: balance });
          totalBalanceUsd += balance; // Assuming 1 DAI = 1 USD
        }
      }

      setAavePositions([
        {
          protocolName: "Aave",
          protocolId: "aave",
          protocolUrl: "https://app.aave.com/",
          protocolLogo: "/aave.png",
          position: {
            balanceUsd: totalBalanceUsd,
            tokens: tokens,
          },
        },
      ]);
    } catch (err) {
      console.error("Error fetching Aave positions:", err);
      setError("Failed to fetch Aave positions");
      setAavePositions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, chainId, usdcBalance, usdtBalance, daiBalance]);

  return { aavePositions, isLoading, error };
}

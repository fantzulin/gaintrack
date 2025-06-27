import { useAccount, useChainId } from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { 
  getCompoundAssets, 
  getTokenPrices, 
  calculateCompoundPosition,
  CompoundPosition 
} from '@/lib/compound-contract';

export function useCompoundPositions() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [compoundPositions, setCompoundPositions] = useState<CompoundPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompoundPositions = async () => {
      if (!isConnected || !address || !chainId) return;

      setIsLoading(true);
      setError(null);

      try {
        // 獲取 provider
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        
        // 獲取 Compound 資產
        const assets = await getCompoundAssets(address, `0x${chainId.toString(16)}`, provider);
        
        if (assets.length > 0) {
          // 獲取代幣價格
          const tokenAddresses = assets.map(asset => asset.underlyingAddress);
          const prices = await getTokenPrices(tokenAddresses, `0x${chainId.toString(16)}`);
          
          // 計算 Compound position
          const compoundPosition = calculateCompoundPosition(assets, prices);
          setCompoundPositions([compoundPosition]);
        } else {
          setCompoundPositions([]);
        }
      } catch (err) {
        setError('Failed to fetch Compound positions');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompoundPositions();
  }, [address, isConnected, chainId]);

  return {
    compoundPositions,
    isLoading,
    error,
  };
} 
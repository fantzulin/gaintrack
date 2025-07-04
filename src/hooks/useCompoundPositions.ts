import { useAccount, useChainId } from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { 
  getCompoundAssets, 
  getTokenPrices, 
  calculateCompoundPosition,
  CompoundPosition 
} from '@/lib/compound-contract';
import { useCompoundSupplyData } from '@/components/defi/compound-supply';

export function useCompoundPositions() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [compoundPositions, setCompoundPositions] = useState<CompoundPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supplyData: compoundSupplyData, isLoading: isSupplyLoading, error: supplyError } = useCompoundSupplyData();

  useEffect(() => {
    const fetchCompoundPositions = async () => {
      if (!isConnected || !address || !chainId || isSupplyLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        
        const assets = await getCompoundAssets(address, `0x${chainId.toString(16)}`, provider);
        
        if (assets.length > 0) {
          const assetsWithApy = assets.map(asset => {
            const supplyInfo = compoundSupplyData.find(data => data.symbol === asset.symbol);
            return {
              ...asset,
              supplyRate: supplyInfo ? supplyInfo.supplyAPY : 0,
            };
          });

          const tokenAddresses = assets.map(asset => asset.underlyingAddress);
          const prices = await getTokenPrices(tokenAddresses, `0x${chainId.toString(16)}`);
          
          const positions = assetsWithApy.map(asset => {
            return calculateCompoundPosition([asset], prices);
          });
          setCompoundPositions(positions);
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
  }, [address, isConnected, chainId, compoundSupplyData, isSupplyLoading]);

  return {
    compoundPositions,
    isLoading: isLoading || isSupplyLoading,
    error: error || supplyError,
  };
}
 
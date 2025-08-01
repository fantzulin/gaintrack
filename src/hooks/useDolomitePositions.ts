import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { DolomitePosition, getDolomiteAssets } from '@/lib/dolomite-contract';
import { useDolomiteSupplyData } from '@/components/defi/dolomite-supply';

export function useDolomitePositions() {
  const { address, isConnected, chainId } = useAccount();
  const { supplyData } = useDolomiteSupplyData();
  const [dolomitePositions, setDolomitePositions] = useState<DolomitePosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDolomitePositions = async () => {
      if (address && isConnected && chainId === 42161) {
        setIsLoading(true);
        setError(null);
        try {
          // Create APY map from supply data
          const apyMap: Record<string, number> = {};
          supplyData.forEach(token => {
            apyMap[token.symbol] = token.supplyAPY;
          });

          const positions = await getDolomiteAssets(address, chainId, apyMap);
          setDolomitePositions(positions);
        } catch (e) {
          setError('Failed to fetch Dolomite positions');
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setDolomitePositions([]);
      }
    };

    fetchDolomitePositions();
  }, [address, isConnected, chainId, supplyData]);

  return { dolomitePositions, isLoading, error };
}
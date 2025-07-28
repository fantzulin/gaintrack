import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { DolomitePosition, getDolomiteAssets } from '@/lib/dolomite-contract';

export function useDolomitePositions() {
  const { address, isConnected, chainId } = useAccount();
  const [dolomitePositions, setDolomitePositions] = useState<DolomitePosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDolomitePositions = async () => {
      if (address && isConnected && chainId === 42161) {
        setIsLoading(true);
        setError(null);
        try {
          const positions = await getDolomiteAssets(address, chainId);
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
  }, [address, isConnected, chainId]);

  return { dolomitePositions, isLoading, error };
}
import { useAccount, useChainId } from 'wagmi';
import { useEffect, useState } from 'react';
import { getWalletAssets, initMoralis, getDefiPositionsSummary } from '@/lib/moralis';

export function useWalletDeFi() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [defi, setDefi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefi = async () => {
      if (!isConnected || !address || !chainId) return;

      setIsLoading(true);
      setError(null);

      try {
        await initMoralis();
        const walletDefi = await getDefiPositionsSummary(address, `0x${chainId.toString(16)}`);
        if (walletDefi && Array.isArray(walletDefi)) {
          setDefi(walletDefi);
        } else {
          setDefi([]);
        }
      } catch (err) {
        setError('Failed to fetch wallet defi');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefi();
  }, [address, isConnected, chainId]);

  return {
    defi,
    isLoading,
    error,
  };
}

export function useWalletAssets() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!isConnected || !address || !chainId) return;

      setIsLoading(true);
      setError(null);

      try {
        await initMoralis();
        const walletAssets = await getWalletAssets(address, `0x${chainId.toString(16)}`);
        if (walletAssets && Array.isArray(walletAssets)) {
          setAssets(walletAssets);
        } else {
          setAssets([]);
        }
      } catch (err) {
        setError('Failed to fetch wallet assets');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [address, isConnected, chainId]);

  return {
    assets,
    isLoading,
    error,
  };
}
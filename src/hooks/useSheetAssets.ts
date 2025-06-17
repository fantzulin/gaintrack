import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface SheetAsset {
  tokenAddress: string;
  tokenSymbol: string;
  costPrice: string;
}

// 簡化的 JSONP 請求函數
function jsonpRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout'));
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeout);
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Script loading failed'));
    };

    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

export function useSheetAssets() {
  const { address } = useAccount();
  const [assets, setAssets] = useState<SheetAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      setAssets([]);
      return;
    }

    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = `https://script.google.com/macros/s/AKfycbwMa0aHW0pQKcD0t_iaCEGKg0H7kjAW2RA6llZBNMxg0rV1GdIkvjz4V63_oc5B0I-j/exec?wallet=${encodeURIComponent(address)}`;
        const response = await jsonpRequest(url);
        
        if (response.success) {
          const assetsData = typeof response.assets === 'string' 
            ? JSON.parse(response.assets) 
            : (response.assets || []);
          setAssets(Array.isArray(assetsData) ? assetsData : []);
        } else {
          throw new Error(response.error || 'Failed to fetch assets');
        }
      } catch (err) {
        console.error('Error fetching sheet assets:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [address]);

  return { assets, isLoading, error };
}
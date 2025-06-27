import { ethers } from 'ethers';
import { COMPOUND_CONTRACTS, COMPOUND_ABI, COMPOUND_TOKENS } from './contracts/compound';

export interface CompoundPosition {
  protocolName: string;
  protocolId: string;
  protocolUrl: string;
  protocolLogo: string;
  position: {
    balanceUsd: number;
    positionDetails: {
      apy: number;
      healthFactor?: number;
      projectedEarningsUsd?: number;
    };
  };
}

export interface TokenPosition {
  symbol: string;
  name: string;
  logo: string;
  supplyBalance: number;
  supplyRate: number;
  exchangeRate: number;
  underlyingAddress: string;
}

// 獲取用戶在 Compound 中的所有資產
export const getCompoundAssets = async (
  address: string, 
  chainId: string,
  provider: ethers.Provider
): Promise<TokenPosition[]> => {
  try {
    const chainName = getChainName(chainId);
    const compoundContracts = COMPOUND_CONTRACTS[chainName as keyof typeof COMPOUND_CONTRACTS];
    
    if (!compoundContracts) {
      console.warn(`Compound not supported on chain ${chainId}`);
      return [];
    }

    const positions: TokenPosition[] = [];
    
    // 遍歷所有 cToken 合約
    const cTokenAddresses = Object.values(compoundContracts);
    
    // 並行查詢所有 cToken 的餘額
    const assetPromises = cTokenAddresses.map(async (cTokenAddress: string) => {
      try {
        const cToken = new ethers.Contract(cTokenAddress, COMPOUND_ABI, provider);
        
        // 查詢用戶在該 cToken 的餘額
        const supplyBalance = await cToken.balanceOf(address);
        
        // 如果餘額為 0，跳過
        if (supplyBalance.toString() === '0') {
          return null;
        }

        const tokenInfo = COMPOUND_TOKENS[cTokenAddress as keyof typeof COMPOUND_TOKENS];
        if (!tokenInfo) {
          console.warn(`Unknown cToken: ${cTokenAddress}`);
          return null;
        }

        // 查詢 underlying token 地址
        let underlyingAddress = cTokenAddress; // 默認值
        try {
          underlyingAddress = await cToken.underlying();
        } catch (error) {
          console.warn(`Could not get underlying for ${cTokenAddress}:`, error);
          // 如果無法查詢 underlying，使用硬編碼的映射
          const underlyingMap: Record<string, string> = {
            '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // cUSDCv3 -> USDC
            '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // cUSDTv3 -> USDT
            '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // cUSDCEv3 -> USDC.e
          };
          underlyingAddress = underlyingMap[cTokenAddress] || cTokenAddress;
        }

        // 查詢 exchange rate
        let exchangeRate = ethers.parseUnits('1', 18); // 默認值
        try {
          exchangeRate = await cToken.exchangeRateStored();
        } catch (error) {
          console.warn(`Could not get exchange rate for ${cTokenAddress}:`, error);
        }

        // 計算實際的 underlying token 餘額
        // 公式：underlyingBalance = cTokenBalance * exchangeRate / (10^18)
        const underlyingBalance = (supplyBalance * exchangeRate) / ethers.parseUnits('1', 18);
        
        // 根據代幣精度格式化餘額
        const formattedBalance = Number(ethers.formatUnits(underlyingBalance, tokenInfo.decimals));

        return {
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          logo: tokenInfo.logo,
          supplyBalance: formattedBalance,
          supplyRate: 0, // 暫時設為 0，之後可以添加利率查詢
          exchangeRate: Number(ethers.formatEther(exchangeRate)),
          underlyingAddress
        };
      } catch (error) {
        console.error(`Error fetching data for cToken ${cTokenAddress}:`, error);
        return null;
      }
    });

    const results = await Promise.all(assetPromises);
    const validResults = results.filter(Boolean) as TokenPosition[];
    
    return validResults;
  } catch (error) {
    console.error('Error fetching Compound assets:', error);
    return [];
  }
};

// 獲取代幣價格（使用 Moralis 或其他價格 API）
export const getTokenPrices = async (tokenAddresses: string[], chainId: string) => {
  // 這裡你需要實現價格查詢邏輯
  // 可以使用 Moralis、CoinGecko 或其他價格 API
  const prices: Record<string, number> = {};
  
  // 示例：硬編碼一些常見代幣的價格
  const commonPrices: Record<string, number> = {
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 1, // USDC (Arbitrum)
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 1, // USDT (Arbitrum)
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': 1, // USDC.e (Arbitrum)
  };
  
  for (const address of tokenAddresses) {
    const price = commonPrices[address] || 0;
    prices[address] = price;
  }

  return prices;
};

// 計算 Compound position
export const calculateCompoundPosition = (
  positions: TokenPosition[],
  prices: Record<string, number>
): CompoundPosition => {
  
  let totalSupplyValue = 0;
  let weightedSupplyAPY = 0;
  let totalSupplyWeight = 0;

  positions.forEach(pos => {
    const price = prices[pos.underlyingAddress] || 0;
    const supplyValue = pos.supplyBalance * price;
    
    totalSupplyValue += supplyValue;
    
    if (supplyValue > 0) {
      weightedSupplyAPY += pos.supplyRate * supplyValue;
      totalSupplyWeight += supplyValue;
    }
  });

  const netAPY = totalSupplyWeight > 0 ? weightedSupplyAPY / totalSupplyWeight : 0;

  const result = {
    protocolName: 'Compound',
    protocolId: 'compound',
    protocolUrl: 'https://app.compound.finance/',
    protocolLogo: 'https://cdn.moralis.io/defi/compound.png',
    position: {
      balanceUsd: totalSupplyValue,
      positionDetails: {
        apy: netAPY,
        healthFactor: undefined, // Compound V3 可能沒有 health factor
        projectedEarningsUsd: totalSupplyValue * (netAPY / 100)
      }
    }
  };

  return result;
};

// 輔助函數：將 chainId 轉換為鏈名稱
function getChainName(chainId: string): string {
  const chainMap: Record<string, string> = {
    '0x1': 'ethereum',
    '0xa4b1': 'arbitrum'
  };
  return chainMap[chainId] || 'ethereum';
} 
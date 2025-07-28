import { ethers } from 'ethers';
import { COMPOUND_CONTRACTS, COMPOUND_ABI, COMPOUND_TOKENS } from './contracts/compound';

export interface PositionToken {
  tokenType: 'supplied';
  logo: string;
  symbol: string;
  balance: number;
  balanceUsd: number;
  apy: number;
}

export interface CompoundPosition {
  protocolName: string;
  protocolId: string;
  protocolUrl: string;
  protocolLogo: string;
  position: {
    balanceUsd: number;
    tokens: PositionToken[];
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
    
    const cTokenAddresses = Object.values(compoundContracts);
    
    const assetPromises = cTokenAddresses.map(async (cTokenAddress: string) => {
      try {
        const cToken = new ethers.Contract(cTokenAddress, COMPOUND_ABI, provider);
        
        const supplyBalance = await cToken.balanceOf(address);
        
        if (supplyBalance.toString() === '0') {
          return null;
        }

        const tokenInfo = COMPOUND_TOKENS[cTokenAddress as keyof typeof COMPOUND_TOKENS];
        if (!tokenInfo) {
          console.warn(`Unknown cToken: ${cTokenAddress}`);
          return null;
        }

        const underlyingMap: Record<string, string> = {
          '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
          '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        };
        const underlyingAddress = underlyingMap[cTokenAddress as keyof typeof underlyingMap] || cTokenAddress;

        let exchangeRate = ethers.parseUnits('1', 18);
        const underlyingBalance = (supplyBalance * exchangeRate) / ethers.parseUnits('1', 18);
        const formattedBalance = Number(ethers.formatUnits(underlyingBalance, tokenInfo.decimals));

        return {
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          logo: tokenInfo.logo,
          supplyBalance: formattedBalance,
          supplyRate: 0, 
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

export const getTokenPrices = async (tokenAddresses: string[], chainId: string) => {
  const prices: Record<string, number> = {};
  
  const commonPrices: Record<string, number> = {
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 1,
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 1,
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': 1,
  };
  
  for (const address of tokenAddresses) {
    const price = commonPrices[address] || 0;
    prices[address] = price;
  }

  return prices;
};

export const calculateCompoundPosition = (
  positions: TokenPosition[],
  prices: Record<string, number>
): CompoundPosition => {
  
  let totalSupplyValue = 0;
  let weightedSupplyAPY = 0;
  let totalSupplyWeight = 0;
  const tokens: PositionToken[] = [];

  positions.forEach(pos => {
    const price = prices[pos.underlyingAddress] || 0;
    const supplyValue = pos.supplyBalance * price;
    
    totalSupplyValue += supplyValue;
    
    if (supplyValue > 0) {
      weightedSupplyAPY += pos.supplyRate * supplyValue;
      totalSupplyWeight += supplyValue;
    }

    tokens.push({
      tokenType: 'supplied',
      logo: pos.logo,
      symbol: pos.symbol,
      balance: pos.supplyBalance,
      balanceUsd: supplyValue,
      apy: pos.supplyRate,
    });
  });

  const netAPY = totalSupplyWeight > 0 ? weightedSupplyAPY / totalSupplyWeight : 0;

  const result = {
    protocolName: 'Compound',
    protocolId: 'compound',
    protocolUrl: 'https://app.compound.finance/',
    protocolLogo: '/compound.png',
    position: {
      balanceUsd: totalSupplyValue,
      tokens: tokens,
      positionDetails: {
        apy: netAPY,
        healthFactor: undefined,
        projectedEarningsUsd: totalSupplyValue * (netAPY / 100)
      }
    }
  };

  return result;
};

function getChainName(chainId: string): string {
  const chainMap: Record<string, string> = {
    '0x1': 'ethereum',
    '0xa4b1': 'arbitrum'
  };
  return chainMap[chainId] || 'ethereum';
} 
import { formatUnits } from "viem";
import { getTokenPrice } from "@/lib/moralis";
import { readContract } from "wagmi/actions";
import { config } from "./rainbowkit";
import {
    DOLOMITE_ADDRESS,
    DOLOMITE_MARGIN_ABI,
    DOLOMITE_TOKENS
} from "./contracts/dolomite";

export interface DolomitePositionToken {
  tokenType: "supplied";
  logo: string;
  symbol: string;
  balance: number;
  balanceUsd: number;
  apy: number;
}

export interface DolomitePosition {
  protocolName: string;
  protocolId: string;
  protocolUrl: string;
  protocolLogo: string;
  position: {
    balanceUsd: number;
    tokens: DolomitePositionToken[];
    positionDetails: {
      apy: number;
      healthFactor?: number;
      projectedEarningsUsd?: number;
    };
  };
}

export interface Par {
  value: bigint;
}

export const getDolomiteAssets = async (
  address: `0x${string}`,
  chainId: number,
  apyMap?: Record<string, number>
): Promise<DolomitePosition[]> => {
  try {
    const balances = await readContract(config, {
      address: DOLOMITE_ADDRESS,
      abi: DOLOMITE_MARGIN_ABI,
      functionName: "getAccountBalances",
      args: [{ owner: address, number: BigInt(0) }],
    });

    if (balances) {
      const receivedMarketIds = balances[0] as readonly BigInt[];
      const receivedTokenAddresses = balances[1] as readonly `0x${string}`[];
      const receivedPars = balances[2] as readonly {
        sign: boolean;
        value: bigint;
      }[];
      const receivedWeis = balances[3] as readonly {
        sign: boolean;
        value: bigint;
      }[];

      const tokens: DolomitePositionToken[] = [];

      const pricePromises = receivedTokenAddresses.map(async (tokenAddress, index) => {
        const tokenInfo = DOLOMITE_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
        if (tokenInfo && index < receivedWeis.length) {
          const wei = receivedWeis[index].value;
          const balance = parseFloat(formatUnits(wei, tokenInfo.decimals));

          if (balance > 0) {
            let usdValue = 0;
            
            try {
              const priceData = await getTokenPrice(
                tokenInfo.address,
                chainId.toString()
              );
              const usdPrice = priceData?.usdPrice || 0;
              usdValue = balance * usdPrice;

              if (usdValue > 0.1) { // Only add if it has meaningful value
                  // Get APY from the provided map or use default values
                  const apy = apyMap?.[tokenInfo.symbol] || 2.0;
                  
                  tokens.push({
                    tokenType: "supplied",
                    logo: tokenInfo.logo,
                    symbol: tokenInfo.symbol,
                    balance: balance,
                    balanceUsd: usdValue,
                    apy: apy,
                  });
              }
            } catch (e) {
              console.error(`Error fetching price for ${tokenInfo.symbol}:`, e);
              
              // If price fetch fails, still try to add token with default values
              if (balance > 0) {
                const apy = apyMap?.[tokenInfo.symbol] || 2.0;
                
                tokens.push({
                  tokenType: "supplied",
                  logo: tokenInfo.logo,
                  symbol: tokenInfo.symbol,
                  balance: balance,
                  balanceUsd: 0, // No USD value available
                  apy: apy,
                });
              }
            }
          }
        }
      });

      await Promise.all(pricePromises);
      if (tokens.length > 0) {
        const positions: DolomitePosition[] = tokens.map(token => ({
          protocolName: "Dolomite",
          protocolId: "dolomite",
          protocolUrl: "https://dolomite.io/",
          protocolLogo: "/dolomite.webp",
          position: {
            balanceUsd: token.balanceUsd,
            tokens: [token],
            positionDetails: {
              apy: token.apy,
              healthFactor: undefined,
              projectedEarningsUsd: token.balanceUsd * (token.apy / 100),
            },
          },
        }));
        return positions;
      }
    }
    return [];
  } catch (error) {
    console.log("User does not have a Dolomite account or no balances");
    return [];
  }
};

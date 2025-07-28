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
  chainId: number
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
      let totalBalanceUsd = 0;

      const pricePromises = DOLOMITE_TOKENS.map(async (token, index) => {
        if (index < receivedWeis.length) {
          const wei = receivedWeis[index].value;
          const balance = parseFloat(formatUnits(wei, token.decimals));

          if (balance > 0) {
            try {
              const priceData = await getTokenPrice(
                token.address,
                chainId.toString()
              );
              const usdPrice = priceData?.usdPrice || 0; // Default to 0 if price not found
              const usdValue = balance * usdPrice;

              tokens.push({
                tokenType: "supplied",
                logo: token.logo,
                symbol: token.symbol,
                balance: balance,
                balanceUsd: usdValue,
                apy: 0,
              });
              return usdValue;
            } catch (e) {
              console.error(`Error fetching price for ${token.symbol}:`, e);
              return 0; // Return 0 if price fetch fails
            }
          }
        }
        return 0; // Return 0 if balance is not positive or index out of bounds
      });

      const usdValues = await Promise.all(pricePromises);
      totalBalanceUsd = usdValues.reduce((sum, value) => sum + value, 0);

      if (tokens.length > 0) {
        const positions: DolomitePosition[] = [
          {
            protocolName: "Dolomite",
            protocolId: "dolomite",
            protocolUrl: "https://dolomite.io/",
            protocolLogo: "/dolomite.webp",
            position: {
              balanceUsd: totalBalanceUsd,
              tokens: tokens,
              positionDetails: {
                apy: 8,
                healthFactor: undefined,
                projectedEarningsUsd: totalBalanceUsd * (10 / 100),
              },
            },
          },
        ];
        return positions;
      }
    }
    return [];
  } catch (error) {
    console.log("User does not have a Dolomite account or no balances");
    return [];
  }
};

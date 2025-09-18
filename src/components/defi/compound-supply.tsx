"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export interface CompoundSupply {
  symbol: string;
  address: string;
  logo: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
}

// Compound V3 Comet Interface ABI - simplified version
const COMET_ABI = [
  "function getUtilization() view returns (uint256)",
  "function getSupplyRate(uint256 utilization) view returns (uint256)",
  "function getBorrowRate(uint256 utilization) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function baseTokenPrice() view returns (uint256)",
];

// Compound V3 Market addresses on Arbitrum
const MARKETS = {
  "USDC.e":"0xa5edbdd9646f8dff606d7448e414884c7d905dca",
  USDT: "0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07",
  USDC: "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf",
};

const assets = [
  {
    symbol: "USDC.e",
    logo: "https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png",
    address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    marketAddress: MARKETS["USDC.e"],
  },
  {
    symbol: "USDT",
    logo: "https://logo.moralis.io/0xa4b1_0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9_00fd48dbec30ef6e8fb563f2b0b82b6a.png",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    marketAddress: MARKETS.USDT,
  },
  {
    symbol: "USDC",
    logo: "https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png",
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    marketAddress: MARKETS.USDC,
  }
  
];

// Constants for APY calculation
const SECONDS_PER_YEAR = 60 * 60 * 24 * 365;
const SCALE_FACTOR = 1e18;

export function useCompoundSupplyData() {
  const [supplyData, setSupplyData] = useState<CompoundSupply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompoundData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

        const results = await Promise.all(
          assets.map(async (asset) => {
            try {
              const marketContract = new ethers.Contract(asset.marketAddress, COMET_ABI, provider);
              
              try {
                const utilization = await marketContract.getUtilization();
                const supplyRate = await marketContract.getSupplyRate(utilization);
                const borrowRate = await marketContract.getBorrowRate(utilization);
                
                // Calculate APY using the official formula
                // APY = (rate / 1e18) * seconds_per_year * 100
                const supplyRatePerSecond = Number(supplyRate) / SCALE_FACTOR;
                const borrowRatePerSecond = Number(borrowRate) / SCALE_FACTOR;
                const supplyAPY = (supplyRatePerSecond * SECONDS_PER_YEAR) * 100;
                const borrowAPY = (borrowRatePerSecond * SECONDS_PER_YEAR) * 100;
                
                return {
                  symbol: asset.symbol,
                  logo: asset.logo,
                  address: asset.address,
                  supplyAPY: Number(supplyAPY.toFixed(2)),
                  borrowAPY: Number(borrowAPY.toFixed(2)),
                  totalSupply: 0,
                };
              } catch (err) {
                console.error(`Error calling functions for ${asset.symbol}:`, err);
                throw err;
              }
            } catch (err) {
              console.error(`Error fetching data for ${asset.symbol}:`, err);
              return {
                symbol: asset.symbol,
                address: asset.address,
                logo: asset.logo,
                supplyAPY: 0,
                borrowAPY: 0,
                totalSupply: 0,
              };
            }
          })
        );

        setSupplyData(results);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching Compound data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch Compound data");
        setIsLoading(false);
      }
    };

    fetchCompoundData();
  }, []);

  return { supplyData, isLoading, error };
} 
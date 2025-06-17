"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export interface AaveSupply {
  symbol: string;
  logo: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
}

// Aave V3 Pool contract ABI (only the functions we need)
const POOL_ABI = [
  "function getReserveData(address asset) view returns (tuple(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint40,address,address,address,address,uint128,uint128,uint128))",
];

// USDC address on Arbitrum
const POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

const assets = [
  {
    symbol: "USDC",
    logo: "https://logo.moralis.io/0xa4b1_0xaf88d065e77c8cc2239327c5edb3a432268e5831_01a431622b9a9ca34308038f8d54751b.png",
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  },
  {
    symbol: "USDT",
    logo: "https://logo.moralis.io/0xa4b1_0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9_00fd48dbec30ef6e8fb563f2b0b82b6a.png",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
  {
    symbol: "Dai",
    logo: "https://logo.moralis.io/0xa4b1_0xda10009cbd5d07dd0cecc66161fc93d7c9000da1_247e8cebb18c62db70489edbff8cc6d8.png",
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },
];

export function useAaveSupplyData() {
  const [supplyData, setSupplyData] = useState<AaveSupply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAaveData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
        const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);

        const results = await Promise.all(
          assets.map(async (asset) => {
            const reserveData = await poolContract.getReserveData(asset.address);
            const supplyAPY = Number(reserveData[2]) / 1e27 * 100;
            const borrowAPY = Number(reserveData[4]) / 1e27 * 100;
            return {
              symbol: asset.symbol,
              logo: asset.logo,
              supplyAPY: Number(supplyAPY.toFixed(2)),
              borrowAPY: Number(borrowAPY.toFixed(2)),
              totalSupply: 0,
            };
          })
        );

        setSupplyData(results);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch Aave data");
        setIsLoading(false);
      }
    };

    fetchAaveData();
  }, []);

  return { supplyData, isLoading, error };
}
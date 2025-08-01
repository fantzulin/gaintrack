"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useWalletAssets } from "@/hooks/useWalletAssets";
import { useCompoundPositions } from "@/hooks/useCompoundPositions";
import { useAavePositions } from "@/hooks/useAavePositions";
import { useDolomitePositions } from "@/hooks/useDolomitePositions";
import { SupplyButton } from "./supply-button";
import { WithdrawButton } from "./withdraw-button";
import Image from "next/image";

interface EarningsPredictorProps {
  currentAPY: number;
  selectedToken: string;
  selectedProtocol: string;
  selectedTokenAddress: string;
}

interface ProjectedData {
  month: number;
  value: number;
}

const STABLE_COINS = [
  { symbol: "USDC", color: "#2775CA" },
  { symbol: "USDT", color: "#26A17B" },
  { symbol: "DAI", color: "#F5AC37" },
  { symbol: "USDCe", color: "#2775CA" },
];

// Token addresses and market addresses
const TOKEN_ADDRESSES = {
  USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  USDCe: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
} as const;

const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 6,
  DAI: 18,
  USDCe: 6,
} as const;

const MARKET_ADDRESSES = {
  aave: {
    USDC: "0x794a61358d6845594f94dc1db02a252b5b4814ad",
    USDT: "0x794a61358d6845594f94dc1db02a252b5b4814ad",
    DAI: "0x794a61358d6845594f94dc1db02a252b5b4814ad",
    USDCe: "",
  },
  compound: {
    USDC: "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf",
    USDT: "0xd98be00b5d27fc98112bde293e487f8d4ca57d07",
    DAI: "",
    USDCe: "0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA",
  },
  dolomite: {
    USDC: "0xf8b2c637A68cF6A17b1DF9F8992EeBeFf63d2dFf",
    USDT: "",
    DAI: "",
    USDCe: "",
  }
} as const;

type Protocol = keyof typeof MARKET_ADDRESSES;
type Token = keyof typeof TOKEN_ADDRESSES;

function getMarketAddress(protocol: string, token: string): string {
  const p = protocol as Protocol;
  const t = token as Token;

  if (p in MARKET_ADDRESSES) {
    const protocolMarkets = MARKET_ADDRESSES[p];
    if (t in protocolMarkets) {
      return protocolMarkets[t];
    }
  }
  console.warn(`Invalid protocol/token combination: ${protocol}/${token}`);
  return "";
}

export function EarningsPredictor({ currentAPY, selectedToken, selectedTokenAddress, selectedProtocol }: EarningsPredictorProps) {
  const { assets, isLoading } = useWalletAssets();
  const { compoundPositions, isLoading: isCompoundPositionsLoading } = useCompoundPositions();
  const { aavePositions, isLoading: isAavePositionsLoading } = useAavePositions();
  const { dolomitePositions, isLoading: isDolomitePositionsLoading } = useDolomitePositions();
  const [projectedData, setProjectedData] = useState<ProjectedData[]>([]);

  // 獲取選中幣種的餘額
  const selectedAsset = assets.find(a => a.tokenAddress._value.toLowerCase() === selectedTokenAddress.toLowerCase());
  const selectedCoin = STABLE_COINS.find(coin => coin.symbol === selectedToken);
  const balance = selectedAsset?.usdValue || 0;

  // 獲取已存入的餘額
  let suppliedBalance = 0;
  if (selectedProtocol === "compound") {
    const suppliedAsset = compoundPositions
      .flatMap((position) => position.position.tokens)
      .find((token) => token.symbol === selectedToken);
    suppliedBalance = suppliedAsset?.balanceUsd || 0;
  } else if (selectedProtocol === "aave") {
    const suppliedAsset = aavePositions
      .flatMap((position) => position.position.tokens)
      .find((token) => token.symbol === selectedToken);
    suppliedBalance = suppliedAsset?.supplyBalance || 0;
  } else if (selectedProtocol === "dolomite") {
    const suppliedAsset = dolomitePositions
    .flatMap((position) => position.position.tokens)
    .find((token) => token.symbol === selectedToken);
  }

  useEffect(() => {
    if (currentAPY > 0 && selectedToken) {
      calculateProjections();
    } else {
      setProjectedData([]);
    }
  }, [balance, currentAPY, selectedToken]);

  const calculateProjections = () => {
    const monthlyRate = currentAPY / 100 / 12;
    const data: ProjectedData[] = [];

    // 計算 12 個月的預測
    for (let i = 0; i <= 12; i++) {
      const month = i;
      const value = balance * Math.pow(1 + monthlyRate, i);
      data.push({
        month,
        value: parseFloat(value.toFixed(2)),
      });
    }

    setProjectedData(data);
  };

  const monthlyEarnings = balance * (currentAPY / 100 / 12);
  const yearlyEarnings = monthlyEarnings * 12;

  // 計算 Y 軸的範圍
  const allValues = projectedData.map(d => d.value);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const yAxisPadding = (maxValue - minValue) * 0.1;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Earnings Predictor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Earnings Predictor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedToken && (
            <div className="space-y-2">
              <Label>{selectedToken} Balance</Label>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center  space-x-2 p-4 bg-muted rounded-lg">
                  {selectedAsset?.logo && (
                    <Image
                      src={selectedAsset.logo}
                      alt={selectedToken}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-2xl font-bold">${balance.toLocaleString()}</span>
                </div>
                {selectedProtocol && selectedToken && (
                  <div className="flex space-x-2">
                    <SupplyButton
                      protocol={selectedProtocol as "aave" | "compound" | "dolomite"}
                      tokenSymbol={selectedToken}
                      tokenAddress={TOKEN_ADDRESSES[selectedToken as keyof typeof TOKEN_ADDRESSES]}
                      marketAddress={getMarketAddress(selectedProtocol, selectedToken)}
                      currentAPY={currentAPY}
                      walletBalance={balance}
                      tokenDecimals={TOKEN_DECIMALS[selectedToken as keyof typeof TOKEN_DECIMALS]}
                    />
                    <WithdrawButton
                      protocol={selectedProtocol as "aave" | "compound"}
                      tokenSymbol={selectedToken}
                      tokenAddress={TOKEN_ADDRESSES[selectedToken as keyof typeof TOKEN_ADDRESSES]}
                      marketAddress={getMarketAddress(selectedProtocol, selectedToken)}
                      suppliedBalance={suppliedBalance}
                      tokenDecimals={TOKEN_DECIMALS[selectedToken as keyof typeof TOKEN_DECIMALS]}
                    />
                  </div>
                )}
              </div>
              {currentAPY > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Monthly Earnings</div>
                      <div className="text-2xl font-bold">${monthlyEarnings.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Yearly Earnings</div>
                      <div className="text-2xl font-bold">${yearlyEarnings.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <div className="h-[400px]">
            {currentAPY > 0 && selectedToken ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: "Month", position: "insideBottom", offset: -5 }}
                    tickFormatter={(value) => `${value} Month`}
                  />
                  <YAxis 
                    label={{ value: "USD", angle: -90, position: "insideLeft" }}
                    domain={[minValue - yAxisPadding, maxValue + yAxisPadding]}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]}
                    labelFormatter={(label) => `${label} Month`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={selectedCoin?.color || "#8884d8"}
                    name={`${selectedToken} Earnings`}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Please click on the supply pool card to view earnings prediction
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
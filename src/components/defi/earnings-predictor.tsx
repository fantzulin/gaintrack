"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useWalletAssets } from "@/hooks/useWalletAssets";
import Image from "next/image";

interface EarningsPredictorProps {
  currentAPY: number;
  selectedToken: string;
}

interface ProjectedData {
  month: number;
  value: number;
}

const STABLE_COINS = [
  { symbol: "USDC", color: "#2775CA" },
  { symbol: "USDT", color: "#26A17B" },
  { symbol: "DAI", color: "#F5AC37" },
];

export function EarningsPredictor({ currentAPY, selectedToken }: EarningsPredictorProps) {
  const { assets, isLoading } = useWalletAssets();
  const [projectedData, setProjectedData] = useState<ProjectedData[]>([]);

  // 獲取選中幣種的餘額
  const selectedAsset = assets.find(a => a.symbol === selectedToken);
  const selectedCoin = STABLE_COINS.find(coin => coin.symbol === selectedToken);
  const balance = selectedAsset?.usdValue || 0;

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
          <CardTitle>收益預測模組</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">載入中...</div>
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
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
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
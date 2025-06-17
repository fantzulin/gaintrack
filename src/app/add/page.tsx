"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAccount } from 'wagmi';
import { useWalletAssets } from "@/hooks/useWalletAssets";
import { useSheetAssets } from "@/hooks/useSheetAssets";
import { useEffect, useState } from "react";
import Image from "next/image";

interface TokenData {
  tokenAddress: string;
  tokenSymbol: string;
  costPrice: string;
}

export default function AddAssetPage() {
  const { address } = useAccount();
  const { assets, isLoading, error } = useWalletAssets();
  const { assets: sheetAssets, isLoading: sheetLoading, error: sheetError } = useSheetAssets();
  const [mounted, setMounted] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (assets) {
      const mergedAssets = assets.map(asset => ({
        ...asset,
        costPrice: sheetAssets.find(sheetAsset => sheetAsset.tokenAddress.toLowerCase() === asset.tokenAddress._value.toLowerCase())?.costPrice || "0",
      }));
      const initialData = mergedAssets
        .filter(asset => asset.usdValue.toFixed(2) > 1)
        .map(asset => ({
          tokenAddress: asset.tokenAddress._value.toLowerCase(),  
          tokenSymbol: asset.symbol,
          costPrice: asset.costPrice,
        }));
      setTokenData(initialData);
    }
  }, [assets]);

  const handleCostPriceChange = (index: number, value: string) => {
    const newData = [...tokenData];
    newData[index].costPrice = value;
    setTokenData(newData);
  };

  async function onSubmit() {
    try {
      const assets = tokenData
        .filter(data => data.costPrice !== "")
        .map(data => ({
          tokenAddress: data.tokenAddress,
          tokenSymbol: data.tokenSymbol,
          costPrice: data.costPrice,
        }));

      const dataToSubmit = {
        wallet: address,
        assets: assets
      };
      
      const response = await fetch("https://script.google.com/macros/s/AKfycbyiyTvTAtDJNlikgA34BA5RlcW-tDW0Zm2S_ygkDxeqrSVTkhXjycuIol4pPFzmp_Cz/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
        mode: "no-cors",
      });

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error saving assets:", error);
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to add assets
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Assets...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add Asset</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="space-y-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">USD Value</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets
              .filter(asset => asset.usdValue.toFixed(2) > 1)
              .map((asset, index) => (
                <TableRow key={`${asset.token_address}-${index}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {asset.logo && (
                        <Image
                          src={asset.logo}
                          alt={asset.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div>{asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(() => {
                      const value = Number(asset.balance) / Math.pow(10, asset.decimals);
                      return isNaN(value) ? '0' : value.toString();
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${asset.usdValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="any"
                      value={tokenData[index]?.costPrice || ""}
                      onChange={(e) => handleCostPriceChange(index, e.target.value)}
                      className="w-32 ml-auto"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <Button onClick={onSubmit} className="w-32">
            Save All
          </Button>
        </div>
      </div>
    </div>
  );
} 